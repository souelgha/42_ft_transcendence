import { multiMode } from "../game_mode/multiplayer/main_multi.js";

export class MultiPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
	}

	async handle() {
		this.render();
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'game-container';
		gameContent.innerHTML = `
		   <canvas id="pongGame" width="800" height="400"></canvas>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);

		multiMode("base");
	}
}