import { aiMode } from "../game_mode/ai_opponent/main_ai.js";

export class AiPage {
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

		aiMode("base");
    }
}