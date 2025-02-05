import { EndNormalGamePage } from '../../pages/EndNormalGamePage.js';
import { firstPaddle, ballStyle, drawDashedLine, displayScoreOne, displayScoreTwo, displayScoreThree, drawWalls } from './style_multi.js';
let canvas = null;
let context = null;
let theme = "base";

class GameWebSocket {
	constructor() {
		canvas = document.getElementById("pongGame");
		context = canvas.getContext("2d");
		canvas.height = window.innerHeight * 0.8;
		canvas.width = canvas.height * (16/9);
		context.clearRect(0, 0, canvas.width, canvas.height);

		//arena
		this.centerX = canvas.width / 2;
		this.centerY = canvas.height / 2;
		this.radius = canvas.height / 2;

		this.lastTouch = "none";

		this.socket = null;
		this.isConnected = false;
		this.gameLoopInterval = null;
		this.gamestate = null;
		this.keys = {
			w: false,
			s: false,
			b: false,
			n: false,
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
		const angleSpeed = 0.05;  // Vitesse de rotation en radians
	
		function clampAngle(value, min, max) {
			return Math.max(min, Math.min(max, value));
		}
	
		// Player 1 (W et S)
		if (this.keys.ArrowUp) {
			this.gameState.player1.startAngle = clampAngle(
				this.gameState.player1.startAngle - angleSpeed,
				0,
				(2 * (Math.PI / 3)) - (Math.PI / 6)
			);
			this.gameState.player1.endAngle = clampAngle(
				this.gameState.player1.endAngle - angleSpeed,
				Math.PI / 6,
				2 * Math.PI / 3
			);
		}
		if (this.keys.ArrowDown) {
			this.gameState.player1.startAngle = clampAngle(
				this.gameState.player1.startAngle + angleSpeed,
				0,
				(2 * (Math.PI / 3)) - (Math.PI / 6)
			);
			this.gameState.player1.endAngle = clampAngle(
				this.gameState.player1.endAngle + angleSpeed,
				Math.PI / 6,
				2 * Math.PI / 3
			);
		}
	
		// Player 2 (Flèches)
		if (this.keys.s) {
			this.gameState.player2.startAngle = clampAngle(
				this.gameState.player2.startAngle - angleSpeed,
				2 * Math.PI / 3,
				4 * Math.PI / 3 - Math.PI / 6
			);
			this.gameState.player2.endAngle = clampAngle(
				this.gameState.player2.endAngle - angleSpeed,
				2 * Math.PI / 3 + Math.PI / 6,
				4 * Math.PI / 3
			);
		}
		if (this.keys.w) {
			this.gameState.player2.startAngle = clampAngle(
				this.gameState.player2.startAngle + angleSpeed,
				2 * Math.PI / 3,
				4 * Math.PI / 3 - Math.PI / 6
			);
			this.gameState.player2.endAngle = clampAngle(
				this.gameState.player2.endAngle + angleSpeed,
				2 * Math.PI / 3 + Math.PI / 6,
				4 * Math.PI / 3
			);
		}
	
		// Player 3 (B et N)
		if (this.keys.b) {
			this.gameState.player3.startAngle = clampAngle(
				this.gameState.player3.startAngle - angleSpeed,
				4 * Math.PI / 3,
				2 * Math.PI - Math.PI / 6
			);
			this.gameState.player3.endAngle = clampAngle(
				this.gameState.player3.endAngle - angleSpeed,
				4 * Math.PI / 3 + Math.PI / 6,
				2 * Math.PI
			);
		}
		if (this.keys.n) {
			this.gameState.player3.startAngle = clampAngle(
				this.gameState.player3.startAngle + angleSpeed,
				4 * Math.PI / 3,
				2 * Math.PI - Math.PI / 6
			);
			this.gameState.player3.endAngle = clampAngle(
				this.gameState.player3.endAngle + angleSpeed,
				4 * Math.PI / 3 + Math.PI / 6,
				2 * Math.PI
			);
		}
	}

	connect() {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws/multi/`;

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
			this.bounceBall();

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
				"radius": canvas.height / 2,
				"typeOfMatch": this.typeOfMatch,
			}
		};

		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
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

	getInfoFromBackend(data)
	{
		this.gameState = {
			player1: {
				color: data.player1.color,
				centerX: data.player1.centerX,
				centerY: data.player1.centerY,
				radius: data.player1.radius,
				startAngle: data.player1.startAngle,
				endAngle:data.player1.endAngle,
				startZone: data.player1.startZone,
				endZone: data.player1.endZone,
				width: data.player1.width,
			},
			player2: {
				color: data.player2.color,
				centerX: data.player2.centerX,
				centerY: data.player2.centerY,
				radius: data.player2.radius,
				startAngle: data.player2.startAngle,
				endAngle:data.player2.endAngle,
				startZone: data.player2.startZone,
				endZone: data.player2.endZone,
				width: data.player2.width,
			},
			player3: {
				color: data.player3.color,
				centerX: data.player3.centerX,
				centerY: data.player3.centerY,
				radius: data.player3.radius,
				startAngle: data.player3.startAngle,
				endAngle:data.player3.endAngle,
				startZone: data.player3.startZone,
				endZone: data.player3.endZone,
				width: data.player3.width,
			},
			ball: {
				x: data.ball.x,
				y: data.ball.y,
				width: data.ball.width,
				height: data.ball.height,
				color: data.ball.color,
				vx: data.ball.speed,
				vy: data.ball.gravity,
			},
			scores: {
				playerOne: data.scores.playerOne,
				playerTwo: data.scores.playerTwo,
				playerThree: data.scores.playerThree,
				scoreMax: data.scores.scoreMax,
			}
		};
	}

	getBallDistanceFromCenter() {
		return Math.sqrt(
			Math.pow(this.gameState.ball.x - this.centerX, 2) + Math.pow(this.gameState.ball.y - this.centerY, 2)
		);
	}

	getBallNextDistanceFromCenter() {
		return Math.sqrt(
			Math.pow((this.gameState.ball.x + this.gameState.ball.vx) - this.centerX, 2)
			+ Math.pow((this.gameState.ball.y + this.gameState.ball.vy) - this.centerY, 2)
		);
	}

	updateBall() {
		this.gameState.ball.x += this.gameState.ball.vx;
		this.gameState.ball.y += this.gameState.ball.vy;
	}
	
	bounceBall() {
		
		const angleBall = this.getAngleOfBall() + Math.PI;
		const distanceBall = this.getBallDistanceFromCenter();

		if (distanceBall >= this.gameState.player1.radius - 25 && distanceBall <= this.gameState.player1.radius - 10
			&& (angleBall >= this.gameState.player1.startAngle && angleBall <= this.gameState.player1.endAngle) 
				&& this.getBallNextDistanceFromCenter() >= distanceBall)
		{
			const paddleCenter = (this.gameState.player1.endAngle - this.gameState.player1.startAngle) / 2;
			const ballCenter = (this.gameState.ball.y + this.gameState.ball.height) / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / ((this.gameState.player1.endAngle - this.gameState.player1.startAngle) / 2);

			const bounceAngle = relativeIntersectY * (Math.PI / 3);
			const speed = (Math.sqrt(this.gameState.ball.vx * this.gameState.ball.vx + this.gameState.ball.vy * this.gameState.ball.vy));
			this.gameState.ball.vx = -speed * Math.cos(bounceAngle);
			this.gameState.ball.vy = speed * Math.sin(bounceAngle);
			this.lastTouch = "player1";
		}
		else if ((distanceBall >= this.gameState.player2.radius - 15 && distanceBall <= this.gameState.player2.radius
			&& angleBall >= this.gameState.player2.startAngle && angleBall <= this.gameState.player2.endAngle)
			&& this.getBallNextDistanceFromCenter() >= distanceBall)
		{
			const paddleCenter = (this.gameState.player2.endAngle - this.gameState.player2.startAngle) / 2;
			const ballCenter = (this.gameState.ball.y + this.gameState.ball.height) / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / ((this.gameState.player2.endAngle - this.gameState.player2.startAngle) / 2);

			const bounceAngle = (relativeIntersectY * (Math.PI / 3));

			const speed = (Math.sqrt(this.gameState.ball.vx * this.gameState.ball.vx + this.gameState.ball.vy * this.gameState.ball.vy));
			
			this.gameState.ball.vx = -speed * Math.cos(bounceAngle);
			this.gameState.ball.vy = speed * Math.sin(bounceAngle);
			this.lastTouch = "player2";
		}
		else if ((distanceBall >= this.gameState.player3.radius - 25 && distanceBall <= this.gameState.player3.radius - 10
			&& angleBall >= this.gameState.player3.startAngle && angleBall <= this.gameState.player3.endAngle)
			&& this.getBallNextDistanceFromCenter() >= distanceBall)
		{
			const paddleCenter = (this.gameState.player3.endAngle - this.gameState.player3.startAngle) / 2;
			const ballCenter = (this.gameState.ball.y + this.gameState.ball.height) / 2;
			const relativeIntersectY = (paddleCenter - ballCenter) / ((this.gameState.player3.endAngle - this.gameState.player3.startAngle) / 2);

			const bounceAngle = relativeIntersectY * (Math.PI / 3);
			const speed = (Math.sqrt(this.gameState.ball.vx * this.gameState.ball.vx + this.gameState.ball.vy * this.gameState.ball.vy));
			this.gameState.ball.vx = -speed * Math.cos(bounceAngle);
			this.gameState.ball.vy = speed * Math.sin(bounceAngle);
			this.lastTouch = "player3";
		}
		else if (distanceBall >= this.radius)
		{
			this.manageScore();
		}
		this.updateBall();
		this.drawGame();
	}

	manageScore()
	{
		const angleBall = this.getAngleOfBall() + Math.PI;

		if (this.lastTouch == "player1" && angleBall > this.gameState.player1.endZone)
			this.gameState.scores.playerOne++;
		else if (this.lastTouch == "player2" && (angleBall < this.gameState.player2.startZone || angleBall > this.gameState.player2.endZone))
			this.gameState.scores.playerTwo++;
		else if (this.lastTouch == "player3" && angleBall < this.gameState.player3.startZone)
			this.gameState.scores.playerThree++;
		else
			console.log("no one touch the ball");
		this.resetBall();
	}

	getAngleOfBall()
	{
		return (Math.atan2(this.centerY - this.gameState.ball.y, this.centerX - this.gameState.ball.x));
	}

	checkScore() {
		if (this.gameState.scores.playerOne == 10
			|| this.gameState.scores.playerTwo == 10 || this.gameState.scores.playerThree == 10)
		{
			if (this.gameState.scores.playerOne == 10)
			{
				stopGame();
				const end = new EndNormalGamePage("PlayerOne");
				end.handle();
			}
			else if (this.gameState.scores.playerTwo == 10)
			{
				stopGame();
				const end = new EndNormalGamePage("PlayerTwo");
				end.handle();
			}
			else
			{
				stopGame();
				const end = new EndNormalGamePage("PlayerThree");
				end.handle();
			}
		}
	}

	resetBall() {
		this.gameState.ball.x = this.centerX;
		this.gameState.ball.y = this.centerY;
	
		if (!this.gameState.ball.speed) this.gameState.ball.speed = 5;
		if (!this.gameState.ball.gravity) this.gameState.ball.gravity = 2;
	
		this.gameState.ball.vx = Math.abs(this.gameState.ball.speed) * (Math.random() > 0.5 ? 1 : -1);
		this.gameState.ball.vy = Math.abs(this.gameState.ball.gravity) * (Math.random() > 0.5 ? 1 : -1);
		this.lastTouch = "none";
	}

	drawGame() {
		context.clearRect(0, 0, canvas.width, canvas.height);
		firstPaddle(context, this.gameState.player1);
		firstPaddle(context, this.gameState.player2);
		firstPaddle(context, this.gameState.player3);
		ballStyle(context, this.gameState.ball);
		drawDashedLine(context, canvas);
		drawWalls(context, canvas)

		const scoreOne = this.gameState.scores.playerOne ?? 0;
		const scoreTwo = this.gameState.scores.playerTwo ?? 0;
		const scoreThree = this.gameState.scores.playerThree ?? 0;

		displayScoreOne(context, scoreOne, canvas);
		displayScoreTwo(context, scoreTwo, canvas);
		displayScoreThree(context, scoreThree, canvas);
	}

	cleanup() {
		window.removeEventListener('keydown', this.keyDownHandler);
		window.removeEventListener('keyup', this.keyUpHandler);
	}
}

let gameSocket = null;

export function multiMode() {
	if (!gameSocket) {
		gameSocket = new GameWebSocket();
	}
}

export function stopGame() {
	if (gameSocket) {
		gameSocket.cleanup();
		gameSocket.stopGameLoop();
		gameSocket.socket.close();
		gameSocket = null;
	}
}
