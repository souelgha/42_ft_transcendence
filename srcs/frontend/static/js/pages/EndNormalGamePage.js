export class EndNormalGamePage {
	constructor(winner, loser) {
        this.container = document.getElementById('dynamicPage');
		this.winner = winner;
        this.loser = loser;
    }

    async handle() {
        this.render();
        this.setupEventListeners();
    }

    render() {
        const gameContent = document.createElement('div');
        gameContent.className = 'match-result-container';
        gameContent.innerHTML = `
            <div class="match-result animate-fade-in">
                <div class="result-header">
                    <h2 class="match-title animate-slide-down">MATCH RESULT</h2>
                    <div class="players-result">
                        <div class="winner-section">
                            <span class="result-label">Winner</span>
                            <div class="player-name winner-name glow-text">${this.winner}</div>
                        </div>
                        <div class="vs-symbol">VS</div>
                        <div class="loser-section">
                            <span class="result-label">Loser</span>
                            <div class="player-name loser-name">${this.loser}</div>
                        </div>
                    </div>
                </div>

                <button id="returnToGame" class="next-match-btn animate-fade-in-up">
                    <span class="btn-text">RETURN TO GAME</span>
                    <div class="btn-animation-container">
                        <span class="btn-ping"></span>
                    </div>
                </button>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);
    }

    setupEventListeners() {
        const returnButton = document.getElementById('returnToGame');
        returnButton.addEventListener('click', () => {
            window.history.pushState({}, '', '/pong');
            window.dispatchEvent(new PopStateEvent('popstate'));
        });
    }
}
