import { NormalGamePage } from './NormalGamePage.js';

export class HomePage {
	async handle() {
		const content = `
			<div id="carouselExample" class="carousel slide">
				<div class="carousel-inner">
					<div class="carousel-item active">
						<div class="home-container">
							<canvas id="ballAnimation1"></canvas>
							<div class="text-center">
								<button id="playButton1" class="play-btn">
									PLAY BASE THEME
								</button>
							</div>
						</div>
					</div>
					<div class="carousel-item">
						<div class="home-container">
							<canvas id="ballAnimation2"></canvas>
							<div class="text-center">
								<button id="playButton2" class="play-btn">
									PLAY RED THEME
								</button>
							</div>
						</div>
					</div>
					<div class="carousel-item">
						<div class="home-container">
							<canvas id="ballAnimation3"></canvas>
							<div class="text-center">
								<button id="playButton3" class="play-btn">
									PLAY BLUE THEME
								</button>
							</div>
						</div>
					</div>
				</div>
				<style>
					.carousel-control-prev-icon,
					.carousel-control-next-icon {
						background-color: transparent; 
						background-image: none; 
						border: solid gray; 
						border-width: 0 4px 4px 0; 
						display: inline-block;
						padding: 10px;
					}

					.carousel-control-prev-icon {
						transform: rotate(135deg);
						margin-left: 5px;
					}

					.carousel-control-next-icon {
						transform: rotate(-45deg);
						margin-right: 5px;
					}
				</style>
				<button class="carousel-control-prev" type="button" data-bs-target="#carouselExample" data-bs-slide="prev">
					<span class="carousel-control-prev-icon" aria-hidden="true"></span>
					<span class="visually-hidden">Previous</span>
				</button>
				<button class="carousel-control-next" type="button" data-bs-target="#carouselExample" data-bs-slide="next">
					<span class="carousel-control-next-icon" aria-hidden="true"></span>
					<span class="visually-hidden">Next</span>
				</button>
			</div>
		`;

		document.getElementById('dynamicPage').innerHTML = content;

		// Initialisation des animations pour chaque slide
		this.initBallAnimation('ballAnimation1');
		this.initBallAnimation2('ballAnimation2');
		this.initBallAnimation3('ballAnimation3');
	}

	initBallAnimation(canvasId) {
		const canvas = document.getElementById(canvasId);
		const ctx = canvas.getContext('2d');
		let x, y, dx, dy, radius;

		// Redimensionner le canvas
		const resizeCanvas = () => {
			canvas.width = window.innerWidth * 0.8;
			canvas.height = window.innerHeight * 0.8;
			canvas.style.margin = '5vh 10vw';
		};

		// Dessiner l'arrière-plan
		const drawBackground = () => {
			ctx.setLineDash([10, 10]);
			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.strokeStyle = '#666';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.setLineDash([]);
			ctx.fillStyle = '#666';
			ctx.fillRect(30, canvas.height / 2 - 40, 10, 80);
			ctx.fillRect(canvas.width - 40, canvas.height / 2 - 40, 10, 80);
		};

		// Initialiser la balle
		const setupBall = () => {
			radius = 8;
			x = canvas.width / 2;
			y = canvas.height / 2;
			dx = 3;
			dy = 3;
		};

		// Animer la balle
		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBackground();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = '#000';
			ctx.fill();
			ctx.closePath();

			if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
			if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;

			x += dx;
			y += dy;

			requestAnimationFrame(animate);
		};

		// const playButton = document.getElementById('playButton1');
		// playButton.addEventListener('click', function () {
		//     new NormalGamePage("base");
		// });

		const playButton = document.getElementById('playButton1');
		playButton.addEventListener('click', function () {
			const gamePage = new NormalGamePage("base");
			gamePage.handle();
		});

		resizeCanvas();
		setupBall();
		animate();

		window.addEventListener('resize', resizeCanvas);
	}

	initBallAnimation2(canvasId) {
		const canvas = document.getElementById(canvasId);
		const ctx = canvas.getContext('2d');
		let x, y, dx, dy, radius;

		// Redimensionner le canvas
		const resizeCanvas = () => {
			canvas.width = window.innerWidth * 0.8;
			canvas.height = window.innerHeight * 0.8;
			canvas.style.margin = '5vh 10vw';
		};

		// Dessiner l'arrière-plan
		const drawBackground = () => {
			ctx.setLineDash([10, 10]);
			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.strokeStyle = '#c83300';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.setLineDash([]);
			ctx.fillStyle = '#c83300';
			ctx.fillRect(30, canvas.height / 2 - 40, 10, 80);
			ctx.fillRect(canvas.width - 40, canvas.height / 2 - 40, 10, 80);
		};

		// Initialiser la balle
		const setupBall = () => {
			radius = 8;
			x = canvas.width / 2;
			y = canvas.height / 2;
			dx = 3;
			dy = 3;
		};

		// Animer la balle
		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBackground();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = '#c83300';
			ctx.fill();
			ctx.closePath();

			if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
			if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;

			x += dx;
			y += dy;

			requestAnimationFrame(animate);
		};

		// const playButton = document.getElementById('playButton2');
		// playButton.addEventListener('click', function () {
		//     new NormalGamePage("red");
		// });

		const playButton = document.getElementById('playButton2');
			playButton.addEventListener('click', function () {
			const gamePage = new NormalGamePage("red");
			gamePage.handle();
		});

		resizeCanvas();
		setupBall();
		animate();

		window.addEventListener('resize', resizeCanvas);
	}

	initBallAnimation3(canvasId) {
		const canvas = document.getElementById(canvasId);
		const ctx = canvas.getContext('2d');
		let x, y, dx, dy, radius;

		// Redimensionner le canvas
		const resizeCanvas = () => {
			canvas.width = window.innerWidth * 0.8;
			canvas.height = window.innerHeight * 0.8;
			canvas.style.margin = '5vh 10vw';
		};

		// Dessiner l'arrière-plan
		const drawBackground = () => {
			ctx.setLineDash([10, 10]);
			ctx.beginPath();
			ctx.moveTo(canvas.width / 2, 0);
			ctx.lineTo(canvas.width / 2, canvas.height);
			ctx.strokeStyle = '#5fa9ff';
			ctx.lineWidth = 2;
			ctx.stroke();

			ctx.setLineDash([]);
			ctx.fillStyle = '#5fa9ff';
			ctx.fillRect(30, canvas.height / 2 - 40, 10, 80);
			ctx.fillRect(canvas.width - 40, canvas.height / 2 - 40, 10, 80);
		};

		// Initialiser la balle
		const setupBall = () => {
			radius = 8;
			x = canvas.width / 2;
			y = canvas.height / 2;
			dx = 3;
			dy = 3;
		};

		// Animer la balle
		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			drawBackground();
			ctx.beginPath();
			ctx.arc(x, y, radius, 0, Math.PI * 2);
			ctx.fillStyle = '#5fa9ff';
			ctx.fill();
			ctx.closePath();

			if (x + dx > canvas.width - radius || x + dx < radius) dx = -dx;
			if (y + dy > canvas.height - radius || y + dy < radius) dy = -dy;

			x += dx;
			y += dy;

			requestAnimationFrame(animate);
		};

		const playButton = document.getElementById('playButton3');
			playButton.addEventListener('click', function () {
			const gamePage = new NormalGamePage("blue");
			gamePage.handle();
		});

		resizeCanvas();
		setupBall();
		animate();

		window.addEventListener('resize', resizeCanvas);
	}
}
