import { TicTacToe } from "./main_tic_tac_toe.js";
export class TicTacToeGamePage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
	}

	async handle() {
		this.render();
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'gameContainer';
		gameContent.innerHTML = `
			<h1 class="game-title">Tic Tac Toe</h1>
			<div id="cellContainer">
				<div cellIndex="0" class="cell"></div>
				<div cellIndex="1" class="cell"></div>
				<div cellIndex="2" class="cell"></div>
				<div cellIndex="3" class="cell"></div>
				<div cellIndex="4" class="cell"></div>
				<div cellIndex="5" class="cell"></div>
				<div cellIndex="6" class="cell"></div>
				<div cellIndex="7" class="cell"></div>
				<div cellIndex="8" class="cell"></div>
			</div>
			<h2 id="statusText"></h2>
			<button class="play-btn" id="restartButton"> Restart </button>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);

		const game = new TicTacToe();
	}
}
