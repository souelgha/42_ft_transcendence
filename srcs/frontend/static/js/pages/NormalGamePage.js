import { normalMode } from '../game_mode/normal/main.js';

export class NormalGamePage {
    constructor(themeReceived, type, socketTournament, infoMatch) {
        this.theme = themeReceived
        this.container = document.getElementById('dynamicPage');
        this.type = type;
        this.socketTournament = socketTournament;
        this.infoMatch = infoMatch;
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

        normalMode(this.theme, this.type, this.socketTournament, this.infoMatch);
    }
}

/* 

    This is exactly the same thing than the HomePage

    but this time we are adding the run of the normalMode() game:

*/