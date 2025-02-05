import { EndTournementPage } from "../tournament/EndTournementPage.js";
import { NextGamePage } from "./NextGamePage.js";
export class TournamentStart {

	constructor(playerName, playerNumber) {
		this.socket = null;
		this.isConnected = false;
		this.playerNumber = playerNumber
		this.playerName = playerName;
		this.infoMatch = null;
	}

	connect() {
		try {
			const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
			const host = window.location.host;
			const wsUrl = `${protocol}//${host}/ws/tournament/`;

			console.log("Attempting to connect:", wsUrl);
			this.socket = new WebSocket(wsUrl);

			this.socket.onopen = () => {
				console.log("WebSocket connection established");
				this.isConnected = true;
				this.sendInfoStarting();
			};

			this.socket.onmessage = (event) => {
				try {
					const data = JSON.parse(event.data);
					this.handleMessage(data);
				} catch (e) {
					console.error("Failed to parse message:", e);
				}
			};

			this.socket.onerror = (error) => {
				console.error("WebSocket error:", error);
			};

			this.socket.onclose = (event) => {
				console.log("WebSocket connection closed:", event.code, event.reason);
				this.isConnected = false;
				// setTimeout(() => this.connect(), 3000);
			};

		} catch (error) {
			console.error("WebSocket connection error:", error);
		}
	}

	sendInfoStarting()
	{
		const data = {
			type: "tournament.starting",
			timestamp: Date.now(),
			start: {
				"numberPlayer": this.playerNumber,
				"players": this.playerName,
			}
		};
	
		if (this.isConnected && this.socket) {
			this.socket.send(JSON.stringify(data));
		} else {
			console.warn("WebSocket not connected");
		}
	}

	handleMessage(data)
	{
		switch (data.type) {
			case "tournament.match":
				this.setNewMatch(data);
				break;
			case "tournament.winner":
				this.endTournement(data);
			case "error":
				console.log(data.type);
				console.error("Server error:", data.message);
				break;
			default:
				console.log("Unhandled message type:", data.type);
		}
	}

	setNewMatch(data)
	{
		this.infoMatch = {
			playerOne: data.player1,
			playerTwo: data.player2,
		}
		
		const game = new NextGamePage("base", "tournament", this.socket, this.infoMatch);
		game.handle();
	}

	endTournement(data)
	{
		this.socket.close();
		const winner = data.winner;
		const endOfTournement = new EndTournementPage(winner);
		endOfTournement.handle();
	}
}