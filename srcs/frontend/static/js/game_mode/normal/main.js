import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { EndGamePage } from '../../tournament/EndGamePage.js';
import { firstPaddle, secondPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, displayPlayerName, drawWalls } from './style.js';
import { firstPaddleBlue, secondPaddleBlue, ballStyleBlue, drawDashedLineBlue, displayScoreOneBlue, displayScoreTwoBlue } from './themeBlue.js';
import { firstPaddleRed, secondPaddleRed, ballStyleRed, drawDashedLineRed, displayScoreOneRed, displayScoreTwoRed } from './themeRed.js';
let canvas = null;
let context = null;
let theme = "base";

class GameWebSocket {
	constructor(typeOfMatch, socketTournament, infoMatch) {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height * (16/9);
		context.clearRect(0, 0, canvas.width, canvas.height);

		/* for tournament */
		this.typeOfMatch = typeOfMatch; // "normal" || "tournament"
		this.socketTournament = socketTournament; // null for normal || socket of tournament
		this.infoMatch = infoMatch; // null for normal || contains name of player for tournament
		/* end */

		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gamestate = null;
		this.keys = {
			w: false,
			s: false,
			ArrowUp: false,
			ArrowDown: false
		};
		this.setupKeyboardControls();
		this.connect();
		this.frameCount = 0;
		this.sendRate = 20;
	}

	setupKeyboardControls() {
		this.keyDownHandler = (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = true;
				e.preventDefault();
			}
		};
	
		this.keyUpHandler = (e) => {
			if (this.keys.hasOwnProperty(e.key)) {
				this.keys[e.key] = false;
				e.preventDefault();
			}
		};
	
		window.addEventListener('keydown', this.keyDownHandler);
		window.addEventListener('keyup', this.keyUpHandler);
	}

	updatePlayerPositions() {
		const moveSpeed = 10;

		// Player 1 movement (W and S keys)
		if (this.keys.w && this.gameState.player1.y > 0) {
			this.gameState.player1.y -= moveSpeed;
		}
		if (this.keys.s && this.gameState.player1.y < canvas.height - this.gameState.player1.height) {
			this.gameState.player1.y += moveSpeed;
		}

		// Player 2 movement (Arrow keys)
		if (this.keys.ArrowUp && this.gameState.player2.y > 0) {
			this.gameState.player2.y -= moveSpeed;
		}
		if (this.keys.ArrowDown && this.gameState.player2.y < canvas.height - this.gameState.player2.height) {
			this.gameState.player2.y += moveSpeed;
		}
	}
	
	connect() {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws/game/`;

			console.log("Attempting to connect:", wsUrl);
			this.socket = new WebSocket(wsUrl);

			this.socket.onopen = () => {
				console.log("WebSocket connection established");
				this.isConnected = true;
				this.sendInfoStarting();
			};

			this.socket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					this.handleMessage(data);
				} catch (e) {
					console.error("Failed to parse message:", e);
				}
			};

			this.socket.onerror = (error) => {
				console.error("WebSocket error:", error);
			};

			this.socket.onclose = (event) => {
				console.log("WebSocket connection closed:", event.code, event.reason);
				this.isConnected = false;
				this.stopGameLoop();
			};

		} catch (error) {
			console.error("WebSocket connection error:", error);
		}
	}

	startGameLoop() {
		if (this.gameLoopInterval) return;

		this.gameLoopInterval = setInterval(() => {
			// Update player positions based on key states
			this.updatePlayerPositions();

			// Draw every frame (60 FPS)
			this.ballBounce();

			this.frameCount++;
			if (this.frameCount >= (60 / this.sendRate)) {
				this.frameCount = 0;
			}
		}, 1000 / 60);  // Still run at 60 FPS locally
	}

	stopGameLoop() {
		if (this.gameLoopInterval) {
			clearInterval(this.gameLoopInterval);
			this.gameLoopInterval = null;
		}
	}

	sendInfoStarting()
	{
		const data = {
			type: "game.starting",
			timestamp: Date.now(),
			start: {
				"windowHeight": canvas.height,
				"windowWidth": canvas.width,
				"typeOfMatch": this.typeOfMatch,
			}
		};
	
		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	sendBallState() {
		if (!this.isConnected) return;

		const updates = {
			type: "game.ballBounce",
			timestamp: Date.now(),
			start: {
				"ball": {
					"x": this.gameState.ball.x,
					"y": this.gameState.ball.y,
					"gravity": this.gameState.ball.gravity,
					"speed": this.gameState.ball.speed,
				},
			}
		};

		this.sendMessage(updates);
	}

	sendMessage(data) {
		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	handleMessage(data) {
		switch (data.type) {
			case "game.starting":
				this.getInfoFromBackend(data);
				this.startGameLoop();
				break;
			case "game.ballBounce":
				this.updateBall(data);
				break;
			case "error":
				console.log(data.type);
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	updateBall(data) {
		this.gameState.ball.y = data.ball.y;
		this.gameState.ball.x = data.ball.x;
		this.gameState.ball.gravity = data.ball.gravity;
	}

	getInfoFromBackend(data)
	{
		this.gameState = {
			player1: {
				x: data.player1.x,
				y: data.player1.y,
				width: data.player1.width,
				height: data.player1.height,
				color: data.player1.color,
				gravity: data.player1.gravity,
			},
			player2: {
				x: data.player2.x,
				y: data.player2.y,
				width: data.player2.width,
				height: data.player2.height,
				color: data.player2.color,
				gravity: data.player2.gravity,
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				width: data.ball.width,
				height: data.ball.height,
				color: data.ball.color,
				gravity: data.ball.gravity,
				speed: data.ball.speed,
			},
			scores: {
				playerOne: data.scores.playerOne,
				playerTwo: data.scores.playerTwo,
				scoreMax: data.scores.scoreMax,
			}
		};
	}

	ballBounce(){
		if(this.gameState.ball.y + this.gameState.ball.gravity <= 0 || this.gameState.ball.y + this.gameState.ball.width + this.gameState.ball.gravity >= canvas.height){
			this.sendBallState();
		} else {
			this.gameState.ball.y += this.gameState.ball.gravity;
			this.gameState.ball.x += this.gameState.ball.speed;

		}
		this.ballWallCollision();
	}

	//make ball bounce against paddle1 or paddle2
	//adding one to the score if not bouncing
	ballWallCollision(){
		if (this.gameState.ball.y + this.gameState.ball.gravity <= this.gameState.player2.y + this.gameState.player2.height
			&& this.gameState.ball.x + this.gameState.ball.width + this.gameState.ball.speed >= this.gameState.player2.x
			&& this.gameState.ball.y + this.gameState.ball.gravity > this.gameState.player2.y) 
		{
			const paddleCenter = this.gameState.player2.y + this.gameState.player2.height / 2;
			const ballCenter = this.gameState.ball.y + this.gameState.ball.height / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / (this.gameState.player2.height / 2);

			const bounceAngle = relativeIntersectY * 0.75;

			const speed = Math.sqrt(this.gameState.ball.speed * this.gameState.ball.speed + this.gameState.ball.gravity * this.gameState.ball.gravity);
			this.gameState.ball.speed = -speed * Math.cos(bounceAngle);
			this.gameState.ball.gravity = speed * Math.sin(bounceAngle);

			this.gameState.ball.x = this.gameState.player2.x - this.gameState.ball.width;
		}
		else if (this.gameState.ball.y + this.gameState.ball.gravity >= this.gameState.player1.y &&
				this.gameState.ball.y + this.gameState.ball.gravity <= this.gameState.player1.y + this.gameState.player1.height &&
				this.gameState.ball.x + this.gameState.ball.speed <= this.gameState.player1.x + this.gameState.player1.width)
		{
			const paddleCenter = this.gameState.player1.y + this.gameState.player1.height / 2;
			const ballCenter = this.gameState.ball.y + this.gameState.ball.height / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / (this.gameState.player1.height / 2);

			const bounceAngle = relativeIntersectY * 0.75;

			const speed = Math.sqrt(this.gameState.ball.speed * this.gameState.ball.speed + this.gameState.ball.gravity * this.gameState.ball.gravity);
			this.gameState.ball.speed = speed * Math.cos(bounceAngle);
			this.gameState.ball.gravity = speed * Math.sin(bounceAngle);

			this.gameState.ball.x = this.gameState.player1.x + this.gameState.ball.width;
		} else if (this.gameState.ball.x + this.gameState.ball.speed < this.gameState.player1.x)
		{
			this.gameState.scores.playerTwo++;
			this.checkScore();
			this.resetBall();
		} else if (this.gameState.ball.x + this.gameState.ball.speed > this.gameState.player2.x + this.gameState.player2.width)
		{
			this.gameState.scores.playerOne++;
			this.checkScore();
			this.resetBall();
		}
		if (theme == "base")
			this.drawGame();
		else if (theme == "red")
			this.drawGameRed();
		else if (theme == "blue")
			this.drawGameBlue();
	}

	checkScore() {
		if (this.typeOfMatch == "tournament" && (this.gameState.scores.playerOne == 5 || this.gameState.scores.playerTwo == 5))
		{
			if (this.gameState.scores.playerOne == 5)
			{
				stopGame();
				const end = new EndGamePage(this.infoMatch.playerOne, this.infoMatch.playerTwo, this.socketTournament, this.infoMatch);
				end.handle();
			}
			else
			{
				stopGame();
				const end = new EndGamePage(this.infoMatch.playerTwo, this.infoMatch.playerOne, this.socketTournament, this.infoMatch);
				end.handle();
			}
		}
		else if (this.typeOfMatch == "normal" && (this.gameState.scores.playerOne == 10 || this.gameState.scores.playerTwo == 10))
		{
			if (this.gameState.scores.playerOne == 10)
			{
				stopGame();
				const end = new EndNormalGamePage("PlayerOne");
				end.handle();
			}
			else
			{
				stopGame();
				const end = new EndNormalGamePage("PlayerTwo");
				end.handle();
			}
		}
	}

	resetBall() {
		this.gameState.ball.x = canvas.width / 2;
		this.gameState.ball.y = canvas.height / 2;
		this.gameState.ball.speed = Math.abs(this.gameState.ball.speed) * (Math.random() > 0.5 ? 1 : -1); // Changer la direction aléatoirement
		this.gameState.ball.gravity = Math.abs(this.gameState.ball.gravity) * (Math.random() > 0.5 ? 1 : -1);
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		firstPaddle(context, this.gameState.player1);
		secondPaddle(context, this.gameState.player2);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas);
		drawWalls(context, canvas)

		const scoreOne = this.gameState.scores.playerOne ?? 0;
		const scoreTwo = this.gameState.scores.playerTwo ?? 0;

		if (this.typeOfMatch == "tournament")
			displayPlayerName(context, canvas, this.infoMatch);
		displayScoreOne(context, scoreOne, canvas);
		displayScoreTwo(context, scoreTwo, canvas);
	}

	drawGameBlue() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		firstPaddleBlue(context, this.gameState.player1);
		secondPaddleBlue(context, this.gameState.player2);
		ballStyleBlue(context, this.gameState.ball);
		drawDashedLineBlue(context, canvas);

		const scoreOne = this.gameState.scores.playerOne ?? 0;
		const scoreTwo = this.gameState.scores.playerTwo ?? 0;

		displayScoreOneBlue(context, scoreOne, canvas);
		displayScoreTwoBlue(context, scoreTwo, canvas);
	}

	drawGameRed() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		firstPaddleRed(context, this.gameState.player1);
		secondPaddleRed(context, this.gameState.player2);
		ballStyleRed(context, this.gameState.ball);
		drawDashedLineRed(context, canvas);

		const scoreOne = this.gameState.scores.playerOne ?? 0;
		const scoreTwo = this.gameState.scores.playerTwo ?? 0;

		displayScoreOneRed(context, scoreOne, canvas);
		displayScoreTwoRed(context, scoreTwo, canvas);
	}

	cleanup() {
		window.removeEventListener('keydown', this.keyDownHandler);
		window.removeEventListener('keyup', this.keyUpHandler);
	}
}

let gameSocket = null;

export function normalMode(themeReceived, typeOfMatch, socketTournament, infoMatch) {
	if (!gameSocket) {
		theme = themeReceived;
		gameSocket = new GameWebSocket(typeOfMatch, socketTournament, infoMatch);
	}
}

export function stopGame() {
	if (gameSocket) {
		gameSocket.cleanup(); // this function is not working properly
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
