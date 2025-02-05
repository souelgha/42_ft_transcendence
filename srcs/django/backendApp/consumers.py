from channels.generic.websocket import WebsocketConsumer
import random
import time
import json
import logging
import math

logger = logging.getLogger(__name__)

class GameConsumer(WebsocketConsumer):
    
    #connection to the WebSocket
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
            logger.debug(f"Decoded data: {data}")

            # search for the type of the message
            message_type = data.get("type")
            print(f"Message type received: {message_type}")

            # Manage the type of the msg
            if message_type == "game.starting":
                response = self.initialisation(data)
            elif message_type == "game.ballBounce":
                response = self.ballBounce(data)
            else:
                response = {
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                }

            # Envoyer la réponse au client
            self.send(text_data=json.dumps(response))

        except json.JSONDecodeError:
            logger.error("Error: Invalid JSON received")
            self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON format"
            }))

    def initialisation(self, data):
        start_data = data.get("start", {})
        window_height = start_data.get("windowHeight", 0)
        window_width = start_data.get("windowWidth", 0)
        typeOfMatch = start_data.get("typeOfMatch", 0)

        if (typeOfMatch == "tournament"):
            response = {
                "type": "game.starting",
                "player1": {
                    "x": 5,
                    "y": window_height * 0.4,
                    "width": window_width / 80,
                    "height": window_height / 6,
                    "color": "black",
                    "gravity": 2,
                },
                "player2": {
                    "x": window_width - 20,
                    "y": window_height * 0.4,
                    "width": window_width / 80,
                    "height": window_height / 6,
                    "color": "black",
                    "gravity": 2,
                },
                "ball": {
                    "x": window_width / 2,
                    "y": window_height / 2,
                    "width": 15,
                    "height": 15,
                    "color": "black",
                    "speed": 16,
                    "gravity": 6,
                },
                "scores": {
                    "playerOne": 0,
                    "playerTwo": 0,
                    "scoreMax": 5,
                }
            }
        else:
            response = {
                "type": "game.starting",
                "player1": { "x": 5, "y": window_height * 0.4, "width": window_width / 80, "height": window_height / 6, "color": "black", "gravity": 2},
                "player2": { "x": window_width - 20, "y": window_height * 0.4, "width": window_width / 80, "height": window_height / 6, "color": "black", "gravity": 2},
                "ball": {"x": window_width / 2, "y": window_height / 2, "width": 15, "height": 15, "color": "black", "speed": 8, "gravity": 3 },
                "scores": {"playerOne": 0, "playerTwo": 0, "scoreMax": 10}
            }
        return response

    def ballBounce(self, data):
        ball = data.get("start", {}).get("ball", {})

        ball["gravity"] = ball["gravity"] * (-1)
        ball["y"] += ball["gravity"]
        ball["x"] += ball["speed"]
        return {
            "type": "game.ballBounce",
            "ball": ball,
        }
    
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
            logger.debug(f"Decoded data: {data}")

            # search for the type of the message
            message_type = data.get("type")
            print(f"Message type received: {message_type}")

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

            self.send(text_data=json.dumps(response))

        except json.JSONDecodeError:
            logger.error("Error: Invalid JSON received")
            self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON format"
            }))
        
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
            
            # if count == 1:
            #     for player in self.infoPlayer["players"]:
            #         if player["phase"] == phase:
            #             player["phase"] += 1
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
        
        
        
class GameMultiConsumer(WebsocketConsumer):
    #connection to the WebSocket
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
            logger.debug(f"Decoded data: {data}")

            # search for the type of the message
            message_type = data.get("type")
            print(f"Message type received: {message_type}")

            # Manage the type of the msg
            if message_type == "game.starting":
                response = self.initialisation(data)
            else:
                response = {
                    "type": "error",
                    "message": f"Unknown message type: {message_type}"
                }

            # Envoyer la réponse au client
            self.send(text_data=json.dumps(response))

        except json.JSONDecodeError:
            logger.error("Error: Invalid JSON received")
            self.send(text_data=json.dumps({
                "type": "error",
                "message": "Invalid JSON format"
            }))

    def initialisation(self, data):
        start_data = data.get("start", {})
        canvas_height = start_data.get("windowHeight", 0)
        canvas_width = start_data.get("windowWidth", 0)
        
        response = {
            "type": "game.starting",
            "player1": {
                "color": "red",
                "centerX": canvas_width / 2,
                "centerY": canvas_height / 2,
                "radius" : (canvas_height / 2) - 10,
                "startAngle": 0,
                "endAngle": math.pi / 6,
                "startZone": 0,
                "endZone": 2 * math.pi / 3,
                "width": 15,
            },
            "player2": {
                "color": "blue",
                "centerX": canvas_width / 2,
                "centerY": canvas_height / 2,
                "radius" : (canvas_height / 2) - 10,
                "startAngle": ((2 * math.pi) / 3),
                "endAngle": ((2 * math.pi) / 3) + (math.pi / 6),
                "startZone": 2 * math.pi / 3,
                "endZone": 4 * math.pi / 3,
                "width": 15,
            },
            "player3": {
                "color": "green",
                "centerX": canvas_width / 2,
                "centerY": canvas_height / 2,
                "radius" : (canvas_height / 2) - 10,
                "startAngle": (4 * math.pi) / 3,
                "endAngle": (4 * math.pi) / 3 + math.pi / 6,
                "startZone": 4 * math.pi / 3,
                "endZone": 2 * math.pi,
                "width": 15,
            },
            "ball": {
                "x": canvas_width / 2,
                "y": canvas_height / 2,
                "width": 15,
                "height": 15,
                "color": "black",
                "speed": 6,
                "gravity": 3,
            },
            "scores": {
                "playerOne": 0,
                "playerTwo": 0,
                "playerThree": 0,
                "scoreMax": 5,
            }
        }
        return response