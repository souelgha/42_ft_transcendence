import { NormalGamePage } from "../pages/NormalGamePage.js";

export class NextGamePage {
    constructor(themeReceived, type, socketTournament, infoMatch) {
        this.theme          = themeReceived;
        this.container      = document.getElementById('dynamicPage');
        this.type          = type;
        this.socketTournament = socketTournament;
        this.infoMatch     = infoMatch;
        this.countdown     = 10;
        this.timer         = null;
    }

    async handle() {
        this.render();
        this.setupEventListeners();
        this.startAnimations();
    }

    render() {
        const gameContent = document.createElement('div');
        gameContent.className = 'page-container next-game-container';
        gameContent.innerHTML = `
            <div class="prepare-game-wrapper animate-fade-in">
                <div class="tournament-match-header">
                    <div class="player-card left animate-slide-right">
                        <div class="player-name-container">
                            <span class="player-label">LEFT PLAYER</span>
                            <h2 class="glow-text">${this.infoMatch.playerOne}</h2>
                            <div class="key-info">
                                <span class="key-label">Controls:</span>
                                <div class="key-buttons">
                                    <span class="key">W</span>
                                    <span class="key">S</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="vs-symbol animate-pulse">VS</div>

                    <div class="player-card right animate-slide-left">
                        <div class="player-name-container">
                            <span class="player-label">RIGHT PLAYER</span>
                            <h2 class="glow-text">${this.infoMatch.playerTwo}</h2>
                            <div class="key-info">
                                <span class="key-label">Controls:</span>
                                <div class="key-buttons">
                                    <span class="key">↑</span>
                                    <span class="key">↓</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="game-countdown animate-fade-in">
                    <div class="countdown-circle">
                        <span id="countdown-number">${this.countdown}</span>
                    </div>
                    <div class="ready-text">GET READY!</div>
                </div>

                <button id="nextGame2" class="start-game-btn animate-pulse">
                    <span class="btn-text">PRESS TO START</span>
                    <div class="btn-animation-container">
                        <span class="btn-ping"></span>
                        <span class="btn-ping"></span>
                    </div>
                </button>
            </div>
        `;

        this.container.innerHTML = '';
        this.container.appendChild(gameContent);
    }

    setupEventListeners() {
        const nextGameBtn = document.getElementById('nextGame2');

        nextGameBtn.addEventListener('mouseenter', () => {
            nextGameBtn.classList.add('btn-hover');
        });

        nextGameBtn.addEventListener('mouseleave', () => {
            nextGameBtn.classList.remove('btn-hover');
        });

        nextGameBtn.addEventListener('click', () => {
            this.handleGameStart();
        });
    }

    handleGameStart() {
        clearInterval(this.timer);

        const wrapper = document.querySelector('.prepare-game-wrapper');
        wrapper.classList.add('fade-out');

        // Add sound effect if needed
        // this.playStartSound();

        setTimeout(() => {
            const newGame = new NormalGamePage(
                this.theme,
                this.type,
                this.socketTournament,
                this.infoMatch
            );
            newGame.handle();
        }, 500);
    }

    startAnimations() {
        // Start countdown animation
        this.timer = setInterval(() => {
            this.countdown--;
            const countdownEl = document.getElementById('countdown-number');

            if (countdownEl) {
                countdownEl.textContent = this.countdown;
                countdownEl.classList.add('pulse');
                setTimeout(() => countdownEl.classList.remove('pulse'), 200);
            }

            if (this.countdown <= 0) {
                clearInterval(this.timer);
                this.handleGameStart();
            }
        }, 1000);
    }
}
