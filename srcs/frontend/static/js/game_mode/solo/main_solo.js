import { firstPaddleSolo, ballSoloStyle, drawDashedLineSolo, drawWallsSolo } from './style.js';

//----------------------GLOBAL GAME ELEMENT----------------------------//
let canvasSolo;
let contextSolo;
let playerOneSolo;
let ballSolo;
let controllerSolo;

function init_canvasSolo(){
	canvasSolo = document.getElementById("pongGame");
	contextSolo = canvasSolo.getContext("2d");
	canvasSolo.width = window.innerWidth;
	canvasSolo.height = window.innerWidth * (16/9);

	//----------------------------OBJET--------------------------------//

	//first paddle right side
	playerOneSolo = new Element({
		x: canvasSolo.width - 20,
		y: canvasSolo.height * 0.4,
		width: canvasSolo.width / 80,
		height: canvasSolo.height / 6,
		color: "#808080",
		gravity: 2,
	})

	//ballSolo
	ballSolo = new Element({
		x: canvasSolo.width / 2,
		y: canvasSolo.height / 2,
		width: 15,
		height: 15,
		color: "#808080",
		speed: 8,
		gravity: 3,
	})

	controllerSolo = {
		"o": {pressedSolo: false, func: movePaddleUpP2Solo},
		"l": {pressedSolo: false, func: movePaddleDownP2Solo},
		}
}

//----------------------------CLASS--------------------------------//

class Element{
	constructor(options){
		this.x = options.x;
		this.y = options.y;
		this.width = options.width;
		this.height = options.height;
		this.color = options.color;
		this.speed = options.speed || 2;
		this.gravity = options.gravity;
	}
}

//----------------------------KEY MOVEMENT--------------------------------//

const keyDownHandlerSolo = (e) => {
	if (controllerSolo[e.key]) {
		controllerSolo[e.key].pressedSolo = true;
	}
}

const keyUpHandlerSolo = (e) => {
	if (controllerSolo[e.key]) {
		controllerSolo[e.key].pressedSolo = false;
	}
}

const executeMovesSolo = () => {
	Object.keys(controllerSolo).forEach(key=> {
		controllerSolo[key].pressedSolo && controllerSolo[key].func()
	})}

function movePaddleUpP2Solo() {
	if (controllerSolo["o"].pressedSolo == true) {
		const nextY = playerOneSolo.y - playerOneSolo.gravity * 7;

		if (nextY > 10) {
			playerOneSolo.y = nextY;
		} else {
			playerOneSolo.y = 10;
		}
	}
}

function movePaddleDownP2Solo() {
	if (controllerSolo["l"].pressedSolo == true) {
		const nextY = playerOneSolo.y + playerOneSolo.gravity * 7;

		if (nextY + playerOneSolo.height < canvasSolo.height - 10) {
			playerOneSolo.y = nextY;
		} else {
			playerOneSolo.y = canvasSolo.height - 10 - playerOneSolo.height; // 壁にぴったりつける
		}
	}
}


//----------------------------METHOD--------------------------------//

//draw elements
function drawElement(element){
	contextSolo.fillStyle = element.color;
	contextSolo.fillRect(element.x, element.y, element.width, element.height);
}

//make ballSolo bounce
function ballSoloBounce(){
	let nextX = ballSolo.x + ballSolo.speed;
	let nextY = ballSolo.y + ballSolo.gravity;

	if(nextY <= 10 || nextY + ballSolo.height >= canvasSolo.height - 10){
		ballSolo.gravity *= -1;
		if (nextY <= 10) {
			ballSolo.y = 10;
		}
		if (nextY + ballSolo.height >= canvasSolo.height - 10) {
			ballSolo.y = canvasSolo.height - 10 - ballSolo.height;
		}
	}

	if (nextX <= 10) {
		ballSolo.speed *= -1;
		ballSolo.x = 10;
	} else {
		ballSolo.x += ballSolo.speed;
	}

	ballSolo.y += ballSolo.gravity;

	ballSoloWallCollision();
}

function ballSoloWallCollision(){
	if (ballSolo.x + ballSolo.width + ballSolo.speed >= playerOneSolo.x &&
		ballSolo.x <= playerOneSolo.x + playerOneSolo.width &&
		ballSolo.y + ballSolo.height >= playerOneSolo.y &&
		ballSolo.y <= playerOneSolo.y + playerOneSolo.height)
	{
		const paddleCenter = playerOneSolo.y + playerOneSolo.height / 2;
		const ballCenter = ballSolo.y + ballSolo.height / 2;
		const relativeIntersectY = (paddleCenter - ballCenter) / (playerOneSolo.height / 2);

		// calculate bounce angle depending on the position of the ball on the paddle
		const bounceAngle = relativeIntersectY * 0.75;

		const speed = Math.sqrt(ballSolo.speed * ballSolo.speed + ballSolo.gravity * ballSolo.gravity);
		ballSolo.speed = -speed * Math.cos(bounceAngle);
		ballSolo.gravity = speed * Math.sin(bounceAngle);

		ballSolo.x = playerOneSolo.x - ballSolo.width;
	}

	if (ballSolo.x + ballSolo.speed > playerOneSolo.x + playerOneSolo.width)
	{
		resetBallSolo();
	}
	drawElementsSolo();
}

function resetBallSolo() {
    ballSolo.x = canvasSolo.width / 2;
    ballSolo.y = canvasSolo.height / 2;
    ballSolo.speed = Math.abs(ballSolo.speed) * (Math.random() > 0.5 ? 1 : -1); // Changer la direction aléatoirement
    ballSolo.gravity = Math.abs(ballSolo.gravity) * (Math.random() > 0.5 ? 1 : -1);
}

function drawElementsSolo(){
	contextSolo.clearRect(0, 0, canvasSolo.width, canvasSolo.height);
	drawWallsSolo(contextSolo, canvasSolo);
	firstPaddleSolo(contextSolo, playerOneSolo);
	ballSoloStyle(contextSolo, ballSolo);
	drawDashedLineSolo(contextSolo, canvasSolo);
}

export function resetGameSolo()
{
	canvasSolo.height = window.innerHeight * 0.8;
	canvasSolo.width = canvasSolo.height * (16/9);
	playerOneSolo.x = canvasSolo.width - 20;
	playerOneSolo.y = canvasSolo.height * 0.4;
	playerOneSolo.width = canvasSolo.width / 80;
	playerOneSolo.height = canvasSolo.height / 6;
	playerOneSolo.gravity = 2;

	ballSolo.x = canvasSolo.width / 2;
	ballSolo.y = canvasSolo.height / 2;
	ballSolo.width = 15;
	ballSolo.height = 15;
	ballSolo.speed = 8;
	ballSolo.gravity = 3;
	
	controllerSolo = {
		"o": {pressedSolo: false, func: movePaddleUpP2Solo},
		"l": {pressedSolo: false, func: movePaddleDownP2Solo},
		}
	window.addEventListener("keydown", keyDownHandlerSolo);
	window.addEventListener("keyup", keyUpHandlerSolo);
}

let animationId = null;

function loopSolo(){
	ballSoloBounce();
	executeMovesSolo();
	animationId = requestAnimationFrame(loopSolo);
}

export function soloMode(){
	if (animationId)
	{
		cancelAnimationFrame(animationId);
		animationId = null;
	}
	init_canvasSolo();
	resetGameSolo();
	loopSolo();
}

export function stopGameSolo() {
	window.removeEventListener("keydown", keyDownHandlerSolo);
	window.removeEventListener("keyup", keyUpHandlerSolo);
	window.removeEventListener('resize', resizeCanvasSolo);
}
