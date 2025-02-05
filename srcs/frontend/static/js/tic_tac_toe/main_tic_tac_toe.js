export class TicTacToe {
	constructor(){
		this.cells = document.querySelectorAll(".cell");
		this.statusText = document.querySelector("#statusText");
		this.restartButton = document.querySelector("#restartButton");
		this.winCondition = [
			[0,1,2],
			[3,4,5],
			[6,7,8],
			[0,3,6],
			[1,4,7],
			[2,5,8],
			[0,4,8],
			[2,4,6],
		]

		this.option = ["", "", "", "", "", "", "", "", ""];
		this.currentPlayer = "X";
		this.running = false;

		this.initGame();
	}

	
	cellClicked(event) {
		const cell = event.target;
		const cellIndex = cell.getAttribute("cellIndex");

		if (this.option[cellIndex] != "" || !this.running)
			return ;
	
		this.updateCell(cell, cellIndex);
		this.checkWinner();
	}

	updateCell(cell, index){
		this.option[index] = this.currentPlayer;
		cell.textContent =  this.currentPlayer;
	}

	changePlayer(){
		this.currentPlayer = (this.currentPlayer == "X") ? "O" : "X";
		this.statusText.textContent = `${this.currentPlayer}'s turn`;
	}

	checkWinner(){
		let roundWon = false;
	
		for (let i = 0; i < this.winCondition.length; i++) {
			const condition = this.winCondition[i];
			const cellA = this.option[condition[0]];
			const cellB = this.option[condition[1]];
			const cellC = this.option[condition[2]];
	
			if (cellA == "" || cellB == "" || cellC == "" )
				continue;
			if (cellA == cellB && cellB == cellC)
			{
				roundWon = true;
				break;
			}
		}
	
		if (roundWon) {
			this.statusText.textContent = `${this.currentPlayer} wins!`;
			this.running = false;
		}
		else if (!this.option.includes("")){
			this.statusText.textContent = `Draw!`;
			this.running = false;
		}
		else
			this.changePlayer();
	}

	restartGame(){
		this.currentPlayer = "X";
		this.option = ["", "", "", "", "", "", "", "", ""];
		this.statusText.textContent = `${this.currentPlayer}'s turn`;
	
		this.cells.forEach(cell => cell.textContent = "")
		this.running = true;
	}

	initGame(){
		// this.cells.forEach(cell => cell.addEventListener("click", this.cellClicked));
		this.cells.forEach(cell => 
			cell.addEventListener("click", (event) => this.cellClicked(event))
		);
		this.restartButton.addEventListener('click', this.restartGame.bind(this));

		this.statusText.textContent = `${this.currentPlayer}'s turn`;
		this.running = true;
	}
}
