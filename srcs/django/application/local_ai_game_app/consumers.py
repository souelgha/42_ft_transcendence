from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async

import uuid
import random
import json
import logging
import asyncio
import math

logger = logging.getLogger(__name__)

#AI
class GameAiConsumer(AsyncWebsocketConsumer):
	infoMatch = {
		"match": []
	}
	#connection to the WebSocket
	async def connect(self):
		logger.info("WebSocket connection attempt")
		try:
			await self.accept()
			logger.info("WebSocket connection accepted")
		except Exception as e:
			logger.error(f"WebSocket connection failed: {e}")
		await self.createGame()

	#interrupt the Websocket
	async def disconnect(self, close_code):
		logger.info(f"WebSocket disconnected with code: {close_code}")
		m = next((m for m in self.infoMatch["match"] if m["client"] == self.scope["client"]), None)
		if m:
			self.infoMatch["match"].remove(m)

	#Manage the info receive
	async def receive(self, text_data):
		try:
			# Decode Json data
			data = json.loads(text_data)

			# search for the type of the message
			message_type = data.get("type")

			# Manage the type of the msg
			if message_type == "game.starting":
				matchId = await self.initialisation(data)
				asyncio.create_task(self.loop(matchId))
				return
			elif message_type == "player.moved":
				await self.moveChange(data)
				return
			elif message_type == "player.pause":
				await self.pause(data)
				return
			elif message_type == "player.unpause":
				await self.unpause(data)
				return
			else:
				response = {
					"type": "error",
					"message": f"Unknown message type: {message_type}"
				}

			try:
				# Envoyer la réponse au client
				await self.send(text_data=json.dumps(response))
			except:
				logger.info("ERROR socket probably closed.")

		except json.JSONDecodeError:
			logger.error("Error: Invalid JSON received")
			try:
				self.send(text_data=json.dumps({
					"type": "error",
					"message": "Invalid JSON format"
				}))
			except:
				logger.info("ERROR socket probably closed.")

	async def pause(self, data):
		matchId = data.get("matchId")
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			m["status"] = "pause"

	async def unpause(self, data):
		matchId = data.get("matchId")
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			m["status"] = "True"
		asyncio.create_task(self.loop(matchId))

	######################## GAME INIT #############################

	async def createGame(self):
		obj = {
			'client': self.scope["client"],
			'matchId' : str(uuid.uuid4()),
			'status': "True",
			'playerOne': {
			},
			'playerTwo': {
			}
		}
		self.infoMatch['match'].append(obj)
		response = {
			"type": "info",
			"matchId": obj["matchId"],
		}
		try:
			await self.send(text_data=json.dumps(response))
		except:
			logger.info("problem here")

	# initialize all characteristics of players and ball
	# based on info of window size
	async def initialisation(self, data):
		start_data = data.get("start", {})
		matchId = start_data.get("matchId")
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			canvas_height = start_data.get("windowHeight", 0)
			canvas_width = start_data.get("windowWidth", 0)


			canvas_dim = min(canvas_height, canvas_width)
			size = int(canvas_dim  / 45)

			m["maxScore"] = 10
			m["canvas"] = {"canvas_height": canvas_height, "canvas_width": canvas_width, "size": size}
			m["playerOne"].update({
				"x": 5,
				"y": canvas_height * 0.4,
				"width": size,
				"height": size * 9,
				"color": "black",
				"score": 0
				})
			m["playerTwo"].update({
				"x": canvas_width - 20,
				"y": canvas_height * 0.4,
				"width": size,
				"height": size * 9,
				"color": "black",
				"score": 0
				})
			m["ball"] = {
				"x": canvas_width / 2,
				"y": canvas_height / 2,
				"size": size,
				"color": "black",
				"speed": 9,
				"accel": 1.05,
				"vx": 0,
				"vy": 0
				}
			self.resetBall(matchId)
		return matchId

	async def loop(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			while (m["status"] == "True"):
				await asyncio.sleep(1 / 60)
				await self.calculBallMovement(matchId)
				await self.send_gamestate(matchId)
			
			if m and m["status"] == "False":
				self.infoMatch["match"].remove(m)

	async def send_gamestate(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:

			response = {
				"type" : "game.state",
				"matchId": m["matchId"],
				"playerOne": m["playerOne"],
				"playerTwo": m["playerTwo"],
				"ball": m["ball"],
				"scoreMax": m["maxScore"]
			}
			if m and m["status"] == "True":
				try:
					await self.send(text_data=json.dumps(response))
				except Exception as e:
					m["status"] = "False"
	
	######################## GAME LOGIC #############################

	#check if movement in y-dir result in wall impact
	def at_wall(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
		# top wall
			if m["ball"]["y"] + m["ball"]["vy"] <= 0:
				return True
			# bottom wall
			elif m["ball"]["y"] + m["ball"]["size"] + m["ball"]["vy"] >=  m["canvas"]["canvas_height"]:
				return True
			else:
				return False

	async def calculBallMovement(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			# if impacting wall, reverse y velocity
			if self.at_wall(matchId):
				m["ball"]["vy"] *= -1
			m["ball"]["x"] += m["ball"]["vx"]
			m["ball"]["y"] += m["ball"]["vy"]
			await self.ballPaddleCollision(matchId)

	# update ball velocities and last touch following strike
	def executeBallStrike(self, matchId, player):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			factor = -1
			if player["x"] < m["canvas"]["canvas_width"] / 2:
				factor = 1
			paddleCenter = player["y"] + player["height"] / 2
			ballCenter = m["ball"]["y"] + m["ball"]["size"] / 2
			relativeIntersectY = (paddleCenter - ballCenter) / (player["height"] / 2)
			bounceAngle = relativeIntersectY * 0.75
			speed = math.sqrt(m["ball"]["vx"] * m["ball"]["vx"] + m["ball"]["vy"] * m["ball"]["vy"])
			m["ball"]["vx"] = factor * speed * math.cos(bounceAngle) * m["ball"]["accel"]
			m["ball"]["vy"] = speed * math.sin(bounceAngle) * m["ball"]["accel"]
			m["ball"]["x"] = player["x"] + factor * m["ball"]["size"]

	# place ball in center of canvas and give it a random initial velocity
	def resetBall(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			m["ball"]["x"] = m["canvas"]["canvas_width"] / 2
			m["ball"]["y"] = m["canvas"]["canvas_height"]  / 2
			angle = random.random() * math.pi / 3
			ran = random.random()
			direction = 1
			if ran > 0.5:
				direction = -1
			ran = random.random()
			phase = math.pi
			if ran > 0.5:
				phase = 0
			angle = direction * angle + phase
			m["ball"]["vx"] = m["ball"]["speed"] * math.cos(angle)
			m["ball"]["vy"] = m["ball"]["speed"] * math.sin(angle)

	# check if location of ball overlaps location of paddle
	def inPaddle(self, player, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			if player["x"] > m["canvas"]["canvas_width"] / 2:
				if (m["ball"]["y"] + m["ball"]["vy"] <= player["y"] + player["height"]
					and m["ball"]["x"] + m["ball"]["size"] + m["ball"]["vx"] >= player["x"]
					and m["ball"]["y"] + m["ball"]["vy"] > player["y"]):
					return True

			if player["x"] < m["canvas"]["canvas_width"] / 2:
				if (m["ball"]["y"] + m["ball"]["vy"] >= player["y"]
					and m["ball"]["y"] + m["ball"]["vy"] <= player["y"] + player["height"]
					and m["ball"]["x"] + m["ball"]["vx"] <= player["x"] + player["width"]):
					return True

			return False

	async def ballPaddleCollision(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			if self.inPaddle(m["playerTwo"], matchId):
				self.executeBallStrike(matchId, m["playerTwo"])
			elif self.inPaddle(m["playerOne"], matchId):
				self.executeBallStrike(matchId, m["playerOne"])
			elif (m["ball"]["x"] + m["ball"]["vx"] < m["playerOne"]["x"]):
				m["playerTwo"]["score"] += 1
				self.resetBall(matchId)
				await self.checkScore(matchId)
			elif (m["ball"]["x"] + m["ball"]["vx"] > m["playerTwo"]["x"] + m["playerTwo"]["width"]):
				m["playerOne"]["score"] += 1
				self.resetBall(matchId)
				await self.checkScore(matchId)
		
	async def checkScore(self, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			if (m["playerOne"]["score"] == m["maxScore"]):
				m["status"] = "False"
				await self.sendMatchResult("p1", "p2", matchId)
			elif (m["playerTwo"]["score"] == m["maxScore"]):
				m["status"] = "False"
				await self.sendMatchResult("p2", "p1", matchId)

	#################### PLAYER MOVE ##########################
	
	async def moveChange(self, data):
		matchId = data.get("matchId")
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			player = data.get("player", None)
			direction = data.get("direction")

			if player == "p1":
				if (direction == "up" and m["playerOne"]["y"] > 0):
					m["playerOne"]["y"] -= 10
				elif (direction == "down" and m["playerOne"]["y"] < m["canvas"]["canvas_height"] - m["playerOne"]["height"]):
					m["playerOne"]["y"] += 10
			elif player == "p2":
				if (direction == "up" and m["playerTwo"]["y"] > 0):
					m["playerTwo"]["y"] -= 10
				elif (direction == "down" and m["playerTwo"]["y"] < m["canvas"]["canvas_height"] - m["playerOne"]["height"]):
					m["playerTwo"]["y"] += 10

	###################### RESULTS ##########################

	async def sendMatchResult(self, winner, loser, matchId):
		m = next((m for m in self.infoMatch["match"] if m["matchId"] == matchId), None)
		if m:
			response = {
				"type" : "match.result",
				"winner": winner,
				"loser": loser,
			}
			try:
				await self.send(text_data=json.dumps(response))
			except:
				logger.info("ERROR socket probably closed.")
			return 0
			
