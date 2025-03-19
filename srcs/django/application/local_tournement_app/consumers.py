from channels.generic.websocket import WebsocketConsumer
import random
import time
import json
import logging
import math

logger = logging.getLogger(__name__)

class TournamentConsumer(WebsocketConsumer):
	def __init__(self):
		super().__init__()
		random.seed(time.time())
		self.infoPlayer = {
			"players": []
		}

	def connect(self):
		logger.info("WebSocket connection attempt")
		try:
			self.accept()
			logger.info("WebSocket connection accepted")
		except Exception as e:
			logger.error(f"WebSocket connection failed: {e}")

	#interrupt the Websocket
	def disconnect(self, close_code):
		logger.info(f"WebSocket disconnected with code: {close_code}")

	#Manage the info receive
	def receive(self, text_data):
		logger.info(f"Received WebSocket data: {text_data}")
		try:
			# Decode Json data
			data = json.loads(text_data)

			# search for the type of the message
			message_type = data.get("type")

			# Manage the type of the msg
			if message_type == "tournament.starting":
				response = self.initialisation(data)
			elif message_type == "tournament.winner":
				self.receiveData(data)
				response = self.checkWinner()
				if response.get("type", {}) == "no winner":
					response = self.runGame()
			else:
				response = {
					"type": "error",
					"message": f"Unknown message type: {message_type}"
				}

			try:
				self.send(text_data=json.dumps(response))
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

	def initialisation(self, data):
		start_data = data.get("start", {})
		players = start_data.get("players", [])

		for player in players:
			obj = {
				"id": player,
				"phase": 0,
				"elim": False,
			}
			self.infoPlayer["players"].append(obj)

		return self.runGame()

	def runGame(self):
		phaseWanted = self.checkPhase()
		players_in_phase = []

		for obj in self.infoPlayer["players"]:
			if obj["phase"] == phaseWanted and obj["elim"] == False:
				players_in_phase.append(obj)

		if len(players_in_phase) == 1:
			player1 = players_in_phase[0]
			phaseWanted += 1
			del players_in_phase[0]
			for obj in self.infoPlayer["players"]:
				if obj["phase"] == phaseWanted and obj["elim"] == False:
					players_in_phase.append(obj)
			player2 = players_in_phase[random.randrange(0, len(players_in_phase))]
		else:
			player1 = players_in_phase[random.randrange(0, len(players_in_phase))]
			player2 = players_in_phase[random.randrange(0, len(players_in_phase))]
			while player2 == player1:
				player2 = players_in_phase[random.randrange(0, len(players_in_phase))]

		response = {
					"type": "tournament.match",
					"player1": player1["id"],
					"player2": player2["id"]
				}
		return response

	def checkPhase(self):
		phase = 0
		while phase != 4:
			count = 0
			for player in self.infoPlayer["players"]:
				if player["phase"] == phase and player["elim"] == False:
					count += 1

			if count > 0:
				return phase
			phase += 1
		return phase



	def receiveData(self, data):
		start_data = data.get("start", {})
		winner = start_data.get("winner", 0)
		loser = start_data.get("loser", 0)

		for player in self.infoPlayer["players"]:
			if player["id"] == winner:
				player["phase"] += 1
			if player["id"] == loser:
				player["elim"] = True
				player["phase"] += 1

	def checkWinner(self):
		count = 0

		for player in self.infoPlayer["players"]:
			if player["elim"] == False:
				count += 1
				winner = player["id"]
		if count == 1:
			response = {
					"type": "tournament.winner",
					"winner": winner,
				}
			return response
		response = {
			"type": "no winner"
		}
		return response

