import { aiMode, stopGameAi } from "../game_mode/ai_opponent/main_ai.js";
import { Page } from './Page.js';

export class AiPage extends Page {
	constructor() {
		super();
	}

	//inherited from Page
		//async handle();
		//render();
		//setupEventListeners();
		//clean();


	startGame() {
		this.game = aiMode("base");
	}

	clean() {
		super.clean();
		stopGameAi();
	}
}
