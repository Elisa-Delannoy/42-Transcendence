import { navigateTo, genericFetch } from "../router";

export function GameView(): string {
  return (document.getElementById("gamehtml") as HTMLTemplateElement).innerHTML;
}

export function initGame() {
	const createGameButton = document.getElementById("create-game");
	createGameButton?.addEventListener("click", async () => {
		await genericFetch("/api/private/game/create", {
			method: "POST"
		});
	});

	const gameListButton = document.getElementById("display-game-list");
	gameListButton?.addEventListener("click", async () => {
		loadGames();
	});

	const tournamentButton = document.getElementById("start-tournament");
	tournamentButton?.addEventListener("click", async () => {
		const { tournamentId } = await genericFetch("/api/private/tournament/create", {
			method: "POST"
		});

		navigateTo(`/tournament/${tournamentId}`);
	});
}

async function loadGames()
{
	const { games } = await genericFetch("/api/private/game/list");
	renderGameList(games);
}

function renderGameList(games: any[]) {
	const container = document.getElementById("game-list");
	if (!container) return;

	if (games.length === 0) {
		container.innerHTML = "<p>Aucune partie disponible.</p>";
		return;
	}

	container.innerHTML = games.map(game => `
	<div class="game-item">
		<p>Game #${game.id}</p>
		<p>Player1 : ${game.playerId1}</p>
		<p>Player2 : ${game.playerId2}</p>
		<p>Status : ${game.state}</p>
		<button data-game-id="${game.id}" class="join-game-btn">Rejoindre</button>
	</div>
	`).join("");

	document.querySelectorAll(".join-game-btn").forEach(btn => {
	btn.addEventListener("click", async () => {
		const id = (btn as HTMLElement).dataset.gameId;

		try
		{
			const res = await genericFetch("/api/private/game/join", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: id
				})
			});
			console.log("Saved data:", res);
		} catch (err) {
			console.error("Error saving game:", err);
		}
	
		navigateTo(`/quickgame/${id}`);
	});
	});
}


interface Player {
	y: number;
	movingUp: boolean;
	movingDown: boolean;
	speed: number;
	score: number;
	attraction: number;
}

interface Ball {
	x: number;
	y: number;
	r: number;
	speed: {
		maxX: number,
		maxY: number,
		minY: number,
		x: number;
		y: number;
	}
}

interface Game {
	player1: Player;
	player2: Player;
	ball: Ball;
}

export class GameInstance {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	private gameID: string;
	private isPlaying = false;
	private anim = 0;

	private audioCtx!: AudioContext;

	private maxScore = 4;
	private increaseSpeed = -1.1;
	private maxAngle = Math.PI / 4;

	private startTime = 0;
	private elapsedTime = 0;

	private startBtn: HTMLButtonElement;
	private stopBtn: HTMLButtonElement;

	// Game state
	private game: Game = {
		player1: {
			y: 0,
			movingUp: false,
			movingDown: false,
			speed: 5,
			score: 0,
			attraction: -2
		},
		player2: {
			y: 0,
			movingUp: false,
			movingDown: false,
			speed: 5,
			score: 0,
			attraction: 2
		},
		ball: {
			x: 0,
			y: 0,
			r: 5,
			speed: {
				maxX: 25,
				maxY: 1.6,
				minY: -1.6,
				x: 2,
				y: 2
			}
		}
	};

	private keydownHandler = (e: KeyboardEvent) => this.onKeyDown(e);
	private keyupHandler = (e: KeyboardEvent) => this.onKeyUp(e);

	constructor(gameID: string) {
		this.gameID = gameID;

		this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d")!;

		this.startBtn = document.querySelector('#start-game')!;
		this.stopBtn = document.querySelector('#stop-game')!;

		this.initPositions();
		this.draw();
		this.attachEvents();
	}

	public getId()
	{
		return this.gameID;
	}

	/** ============================================================
	 ** INIT
	 *============================================================ */
	private initPositions() {
		this.game.player1.y = this.canvas.height / 2 - 30;
		this.game.player2.y = this.canvas.height / 2 - 30;

		this.game.ball.x = this.canvas.width / 2;
		this.game.ball.y = this.canvas.height / 2;
	}

	private attachEvents() {
		document.addEventListener("keydown", this.keydownHandler);
		document.addEventListener("keyup", this.keyupHandler);

		this.startBtn.addEventListener("click", () => this.start());
		this.stopBtn.addEventListener("click", () => this.stop());
	}

	/** ============================================================
	 ** START / STOP
	 *============================================================ */
	private async start() {
		if (this.isPlaying) return;

		this.isPlaying = true;

		try
		{
			const res = await genericFetch("/api/private/game/update/status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: this.gameID,
					status: "playing"
				})
			});
			console.log("Saved data:", res);
		} catch (err) {
			console.error("Error saving game:", err);
		}

		this.startBtn.disabled = true;
		this.stopBtn.disabled = false;

		this.audioCtx = new AudioContext();
		this.randomizeBall();

		this.resetGame();
		this.startTimer();
		this.play();
	}

	private stop() {
		this.isPlaying = false;
		cancelAnimationFrame(this.anim);

		this.startBtn.disabled = false;
		this.stopBtn.disabled = true;

		this.resetGame();
	}

	public destroy() {
		this.stop();
		cancelAnimationFrame(this.anim);

		document.removeEventListener("keydown", this.keydownHandler);
		document.removeEventListener("keyup", this.keyupHandler);

		console.log("Game destroyed and listeners removed");
	}

	/** ============================================================
	 ** TIMER
	 *============================================================ */
	private startTimer() {
		this.startTime = Date.now();
	}

	private stopTimer() {
		this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
	}

	/** ============================================================
	 ** GAME LOOP
	 *============================================================ */
	private play = () => {
		if (!this.isPlaying) {
			this.stopBtn.disabled = true;
			this.startBtn.disabled = true;
			this.stopTimer();
			this.displayWinner();
			return;
		}

		this.moveAll();
		this.draw();
		this.anim = requestAnimationFrame(this.play);
	};

	/** ============================================================
	 ** CONTROLS
	 *============================================================ */
	private onKeyDown(e: KeyboardEvent) {
		if (e.key === "w" || e.key === "W") this.game.player1.movingUp = true;
		if (e.key === "s" || e.key === "S") this.game.player1.movingDown = true;
		if (e.key === "o" || e.key === "O") this.game.player2.movingUp = true;
		if (e.key === "l" || e.key === "L") this.game.player2.movingDown = true;
	}

	private onKeyUp(e: KeyboardEvent) {
		if (e.key === "w" || e.key === "W") this.game.player1.movingUp = false;
		if (e.key === "s" || e.key === "S") this.game.player1.movingDown = false;
		if (e.key === "o" || e.key === "O") this.game.player2.movingUp = false;
		if (e.key === "l" || e.key === "L") this.game.player2.movingDown = false;
	}

	/** ============================================================
	 ** GAME LOGIC
	 *============================================================ */
	private moveAll() {
		this.movePlayer(this.game.player1);
		this.movePlayer(this.game.player2);
		this.moveBall();
	}

	private movePlayer(player: any) {
		if (player.movingUp && player.y > 0) player.y -= player.speed;
		if (player.movingDown && player.y + 60 < this.canvas.height) player.y += player.speed;
	}

	private moveBall() {
		const ball = this.game.ball;

		if (ball.y > this.canvas.height || ball.y < 0) {
			this.playSound(500, 60);
			ball.speed.y *= -1;
		}

		if (ball.x > this.canvas.width - 5)
			this.collide(this.game.player2, this.game.player1);
		else if (ball.x < 5)
			this.collide(this.game.player1, this.game.player2);

		ball.x += ball.speed.x;
		ball.y += ball.speed.y;
	}

	private collide(player: any, otherPlayer: any) {
		const ball = this.game.ball;

		if (ball.y < player.y || ball.y > player.y + 60) {
			this.playSound(300, 300);

			this.resetPos();
			otherPlayer.score++;

			ball.speed.x = player.attraction;

			if (otherPlayer.score === this.maxScore) this.isPlaying = false;
		} else {
			this.playSound(700, 80);
			this.modifyBallAngle(player);
			this.increaseBallSpeed();
		}
	}

	/** ============================================================
	 ** UTILS FUNCTIONS
	 *============================================================ */
	private randomizeBall() {
		this.game.ball.speed.x = Math.random() < 0.5 ? -2 : 2;
	}

	private resetPos() {
		this.game.player1.y = this.canvas.height / 2 - 30;
		this.game.player2.y = this.canvas.height / 2 - 30;
		this.game.ball.x = this.canvas.width / 2;
		this.game.ball.y = this.canvas.height / 2;

		const b = this.game.ball;
		b.speed.y = Math.random() * (b.speed.maxY - b.speed.minY) + b.speed.minY;
	}

	private resetGame() {
		this.resetPos();
		this.game.player1.score = 0;
		this.game.player2.score = 0;
		this.draw();
	}

	private increaseBallSpeed() {
		const b = this.game.ball;

		const sign = b.speed.x * this.increaseSpeed < 0 ? -1 : 1;

		if (Math.abs(b.speed.x * this.increaseSpeed) > b.speed.maxX)
			b.speed.x = b.speed.maxX * sign;
		else
			b.speed.x *= this.increaseSpeed;
	}

	private modifyBallAngle(player: any) {
		const paddleCenter = player.y + 30;
		let hitPos = this.game.ball.y - paddleCenter;

		const normalized = hitPos / 30;
		const bounceAngle = normalized * this.maxAngle;

		const speed = Math.sqrt(
			this.game.ball.speed.x ** 2 + this.game.ball.speed.y ** 2
		);

		this.game.ball.speed.y = speed * Math.sin(bounceAngle);
	}

	private playSound(freq: number, duration: number) {
		const o = this.audioCtx.createOscillator();
		const g = this.audioCtx.createGain();

		o.connect(g);
		g.connect(this.audioCtx.destination);

		o.type = "square";
		o.frequency.value = freq;
		g.gain.setValueAtTime(0.1, this.audioCtx.currentTime);

		o.start();
		o.stop(this.audioCtx.currentTime + duration / 1000);
	}

	/** ============================================================
	 ** DRAW
	 *============================================================ */
	private draw() {
		const ctx = this.ctx;

		ctx.fillStyle = "black";
		ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// middle line
		ctx.strokeStyle = "white";
		ctx.beginPath();
		ctx.moveTo(this.canvas.width / 2, 0);
		ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		ctx.stroke();

		// paddles
		ctx.fillStyle = "white";
		ctx.fillRect(0, this.game.player1.y, 10, 60);
		ctx.fillRect(
			this.canvas.width - 10,
			this.game.player2.y,
			10,
			60
		);

		// ball
		ctx.beginPath();
		ctx.arc(this.game.ball.x, this.game.ball.y, 5, 0, Math.PI * 2);
		ctx.fill();

		// score
		ctx.font = "40px Verdana";
		ctx.textAlign = "center";
		ctx.fillText(`${this.game.player1.score}`, this.canvas.width * 0.43, 50);
		ctx.fillText(`${this.game.player2.score}`, this.canvas.width * 0.57, 50);
	}

	/** ============================================================
	 ** ENDGAME
	 *============================================================ */
	private displayWinner() {
		const ctx = this.ctx;

		ctx.fillStyle = "white";
		ctx.font = "40px Arial";
		ctx.textAlign = "center";

		let winnerId, loserId, winnerText;

		if (this.game.player1.score > this.game.player2.score) {
			winnerText = "Player 1 Wins!";
			winnerId = 1;
			loserId = 2;
		} else {
			winnerText = "Player 2 Wins!";
			winnerId = 2;
			loserId = 1;
		}

		ctx.fillText(winnerText, this.canvas.width / 2, this.canvas.height / 2);

		this.sendGameResult(
			winnerId,
			loserId,
			this.game.player1.score,
			this.game.player2.score,
			this.elapsedTime,
			this.gameID
		);
	}

	/** ============================================================
	 ** API
	 *============================================================ */
	private async sendGameResult(
		winnerId: number,
		loserId: number,
		winnerScore: number,
		loserScore: number,
		duration: number,
		id: string
	) {
		try {
			const res = await genericFetch("/api/private/game/end", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					winner_id: winnerId,
					loser_id: loserId,
					winner_score: winnerScore,
					loser_score: loserScore,
					duration_game: duration,
					id: id
				})
			});

			console.log("Saved data:", res);
		} catch (err) {
			console.error("Error saving game:", err);
		}
	}
}
