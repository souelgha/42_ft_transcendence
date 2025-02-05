import { soloMode } from '../game_mode/solo/main_solo.js';

export class SoloGamePage {
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

        soloMode();
    }
}

/* 

    This is exactly the same thing than the HomePage

    but this time we are adding the run of the SoloMode game:

*/