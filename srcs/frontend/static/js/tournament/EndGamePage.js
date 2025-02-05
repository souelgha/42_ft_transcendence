export class EndGamePage {
	constructor(winner, loser, socket, infoMatch) {
        this.container = document.getElementById('dynamicPage');
		this.winner = winner;
        this.loser = loser;
        this.socketTournament = socket;
        this.infoMatch = infoMatch;
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

                <button id="nextGame" class="next-match-btn animate-fade-in-up">
                    <span class="btn-text">NEXT MATCH</span>
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
        const nextGameButton = document.getElementById('nextGame');
        nextGameButton.addEventListener('click', () => {
            const data = {
                type: "tournament.winner",
                timestamp: Date.now(),
                start: {
                    "winner": this.winner,
                    "loser": this.loser,
                }
            };

            if (this.socketTournament) {
                this.socketTournament.send(JSON.stringify(data));
            } else {
                console.warn("WebSocket not connected");
            }
        });
    }
}
