import { TournamentStart } from "./TournamentStart.js";

TournamentStart
export class TournamentPage {
	constructor() {
		this.container = document.getElementById('dynamicPage');
		this.numberOfPlayers = 3;
		this.maxPlayers = 8;
		this.minPlayers = 3;
	}

	async handle() {
		this.render();
	}

	render() {
		const gameContent = document.createElement('div');
		gameContent.className = 'tournament-container';
		gameContent.innerHTML = `
			<div class="tournament-header">
				<h1>Tournament Mode</h1>
				<p class="subtitle">Create your tournament bracket</p>
			</div>

			<div class="tournament-setup">
				<div class="players-section">
					<h3>Tournament Players</h3>
					<div class="players-counter">
						<span class="counter-label">Players: </span>
						<span class="counter-value">${this.numberOfPlayers}</span>
						<span class="counter-max">/ ${this.maxPlayers}</span>
					</div>

					<div class="players-list" id="players">
						${this.generatePlayerInputs()}
					</div>

					<div class="player-controls">
						<button id="add" class="tournament-btn add-btn" ${this.numberOfPlayers >= this.maxPlayers ? 'disabled' : ''}>
							<i class="fas fa-plus"></i>
							Add Player
						</button>
					</div>
				</div>

				<div class="tournament-actions">
					<button id="play" class="tournament-btn start-btn">
						<i class="fas fa-play"></i>
						Start Tournament
					</button>
				</div>
			</div>
		`;

		this.container.innerHTML = '';
		this.container.appendChild(gameContent);

		this.managePage();
	}

	generatePlayerInputs() {
		let inputs = '';
		for (let i = 1; i <= this.numberOfPlayers; i++) {
			inputs += `
				<div class="player-input-container" data-player="${i}">
					<div class="input-wrapper">
						<span class="player-number">#${i}</span>
						<input class="tournament-input" type="text" placeholder="Enter player name">
						<button type="button" class="close remove-player-btn" aria-label="Remove player" ${this.numberOfPlayers <= this.minPlayers ? 'disabled' : ''}>
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
				</div>
			`;
		}
		return inputs;
	}

	validatePlayerNames(isSubmitting = false) {
		const inputs = document.querySelectorAll('.tournament-input');
		const names = Array.from(inputs).map(input => input.value.trim());
		const errors = [];

		// Reset all invalid classes first
		inputs.forEach(input => input.classList.remove('invalid'));

		// Check for empty names only when submitting
		if (isSubmitting) {
			const emptyNames = names.some((name, index) => {
				if (!name) {
					inputs[index].classList.add('invalid');
					return true;
				}
				return false;
			});

			if (emptyNames) {
				errors.push('All players must have names');
			}
		}

		// Check for duplicate names
		const duplicateIndexes = new Set();
		names.forEach((name, index) => {
			if (name) {  // Only check non-empty names
				names.forEach((otherName, otherIndex) => {
					if (index !== otherIndex && name === otherName && otherName) {
						duplicateIndexes.add(index);
						duplicateIndexes.add(otherIndex);
					}
				});
			}
		});

		// Mark duplicates as invalid
		if (duplicateIndexes.size > 0) {
			duplicateIndexes.forEach(index => {
				inputs[index].classList.add('invalid');
			});
			errors.push('Duplicate player names are not allowed');
		}

		return errors;
	}

	showValidationModal(errors) {
		const modal = document.createElement('div');
		modal.className = 'validation-modal';
		modal.innerHTML = `
			<div class="modal-content">
				<h3>Please Fix the Following:</h3>
				<ul>
					${errors.map(error => `<li>${error}</li>`).join('')}
				</ul>
				<button class="tournament-btn" onclick="this.closest('.validation-modal').remove()">
					OK
				</button>
			</div>
		`;
		document.body.appendChild(modal);
	}

	managePage() {
		const addButton = document.getElementById('add');
		const playButton = document.getElementById('play');
		const playersList = document.getElementById('players');
		const counterValue = document.querySelector('.counter-value');

		// Handle add player functionality
		addButton.addEventListener('click', () => {
			if (this.numberOfPlayers < this.maxPlayers) {
				this.numberOfPlayers++;

				const newPlayerInput = document.createElement('div');
				newPlayerInput.className = 'player-input-container';
				newPlayerInput.dataset.player = this.numberOfPlayers;
				newPlayerInput.innerHTML = `
					<div class="input-wrapper">
						<span class="player-number">#${this.numberOfPlayers}</span>
						<input class="tournament-input" type="text" placeholder="Enter player name">
						<button type="button" class="close remove-player-btn" aria-label="Remove player">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
				`;
				playersList.appendChild(newPlayerInput);

				// Update UI elements
				counterValue.textContent = this.numberOfPlayers;
				addButton.disabled = this.numberOfPlayers >= this.maxPlayers;
				this.updateRemoveButtons();
				this.updatePlayerNumbers();
			}
		});

		// Handle individual player removal
		playersList.addEventListener('click', (e) => {
			const removeBtn = e.target.closest('.remove-player-btn');
			if (removeBtn && this.numberOfPlayers > this.minPlayers) {
				const playerContainer = removeBtn.closest('.player-input-container');
				playerContainer.remove();
				this.numberOfPlayers--;

				// Update UI elements
				counterValue.textContent = this.numberOfPlayers;
				addButton.disabled = false;
				this.updateRemoveButtons();
				this.updatePlayerNumbers();
			}
		});

		// Real-time name validation
		playersList.addEventListener('input', (e) => {
			if (e.target.classList.contains('tournament-input')) {
				this.validatePlayerNames(false);  // Real-time validation
			}
		});

		// Handle tournament start
		playButton.addEventListener('click', () => {
			const errors = this.validatePlayerNames(true);  // Submission validation

			if (errors.length > 0) {
				this.showValidationModal(errors);
				return;
			}

			const inputs = document.querySelectorAll('.tournament-input');
			const players = Array.from(inputs).map(input => input.value.trim());
			const tournament = new TournamentStart(players, this.numberOfPlayers);
			tournament.connect();
		});
	}

	// Helper method to update player numbers
	updatePlayerNumbers() {
		const players = document.querySelectorAll('.player-input-container');
		players.forEach((player, index) => {
			const number = index + 1;
			player.dataset.player = number;
			player.querySelector('.player-number').textContent = `#${number}`;
		});
	}

	// Helper method to update remove buttons visibility
	updateRemoveButtons() {
		const removeButtons = document.querySelectorAll('.remove-player-btn');
		removeButtons.forEach(btn => {
			btn.disabled = this.numberOfPlayers <= this.minPlayers;
		});
	}
}
