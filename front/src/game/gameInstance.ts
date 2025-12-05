// import { genericFetch } from "../router";
import { GameNetwork, GameState } from "./gameNetwork";

export class GameInstance {
	private role: "player1" | "player2" | null = null;
	private currentState: GameState = {
		ball: { x: 0, y: 0 },
		paddles: { player1: 0, player2: 0 },
		score: { player1: 0, player2: 0 }
	};
	private network: GameNetwork | null = null;

	setNetwork(network: GameNetwork, role: "player1" | "player2") {
		this.network = network;
		this.role = role;
	}

	applyServerState(state: Partial<GameState>) {
		this.currentState = { ...this.currentState, ...state };
	}

	getCurrentState() {
		return this.currentState;
	}

	sendInput(direction: "up" | "down" | "stop") {
		if (!this.network || !this.role)
			return;
		this.network.sendInput(direction);
	}
}






// interface Player {
// 	id: number,
// 	y: number;
// 	movingUp: boolean;
// 	movingDown: boolean;
// 	speed: number;
// 	score: number;
// 	attraction: number;
// }

// interface Ball {
// 	x: number;
// 	y: number;
// 	r: number;
// 	speed: {
// 		maxX: number,
// 		maxY: number,
// 		minY: number,
// 		x: number;
// 		y: number;
// 	}
// }

// interface Game {
// 	player1: Player;
// 	player2: Player;
// 	ball: Ball;
// }

// export class GameInstance {
// 	private networkStatus: "ok" | "disconnected" | "network_error" = "ok";

// 	public setNetworkStatus(s: "ok" | "disconnected" | "network_error") {
// 		this.networkStatus = s;
// 	}

// 	public getNetworkStatus() {
// 		return this.networkStatus;
// }

// 	private canvas: HTMLCanvasElement;
// 	private ctx: CanvasRenderingContext2D;

// 	private gameID: string;
// 	private isPlaying = false;
// 	private anim = 0;

// 	private audioCtx!: AudioContext;

// 	private maxScore = 10;
// 	private increaseSpeed = -1.1;
// 	private maxAngle = Math.PI / 4;

// 	private startTime = 0;
// 	private elapsedTime = 0;


// 	private keydownHandler = (e: KeyboardEvent) => this.onKeyDown(e);
// 	private keyupHandler = (e: KeyboardEvent) => this.onKeyUp(e);

// 	constructor(gameID: string) {
// 		this.gameID = gameID;

// 		this.canvas = document.querySelector("canvas") as HTMLCanvasElement;
// 		this.ctx = this.canvas.getContext("2d")!;

// 		this.initPositions();
// 		this.draw();
// 		this.attachEvents();
// 	}


// 	/** ============================================================
// 	 ** INIT
// 	 *============================================================ */
// 	private initPositions() {
// 		this.game.player1.y = this.canvas.height / 2 - 30;
// 		this.game.player2.y = this.canvas.height / 2 - 30;

// 		this.game.ball.x = this.canvas.width / 2;
// 		this.game.ball.y = this.canvas.height / 2;
// 	}

// 	private attachEvents() {
// 		document.addEventListener("keydown", this.keydownHandler);
// 		document.addEventListener("keyup", this.keyupHandler);
// 	}
// 	/** ============================================================
// 	 ** START / STOP
// 	 *============================================================ */
// 	public async start() {
// 		if (this.isPlaying) return;

// 		this.isPlaying = true;

// 		//update game status in playing
// 		try
// 		{
// 			const res = await genericFetch("/api/private/game/update/status", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({
// 					id: this.gameID,
// 					status: "playing"
// 				})
// 			});
// 			console.log("Saved data:", res);
// 		} catch (err) {
// 			console.error("Error saving game:", err);
// 		}

// 		this.audioCtx = new AudioContext();
		
// 		if (this.role === "player1") {
// 			this.resetGame();
// 			this.randomizeBall();
// 			this.startTimer();
// 		}
// 		this.play();
// 	}

// 	private stop() {
// 		this.isPlaying = false;
// 		cancelAnimationFrame(this.anim);
// 		this.resetGame();
// 	}

// 	public destroy() {
// 		this.stop();
// 		cancelAnimationFrame(this.anim);

// 		document.removeEventListener("keydown", this.keydownHandler);
// 		document.removeEventListener("keyup", this.keyupHandler);

// 		console.log("Game destroyed and listeners removed");
// 	}

// 	/** ============================================================
// 	 ** TIMER
// 	 *============================================================ */
// 	private startTimer() {
// 		this.startTime = Date.now();
// 	}

// 	private stopTimer() {
// 		this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
// 	}

// 	/** ============================================================
// 	 ** GAME LOOP
// 	 *============================================================ */
// 	private play = () => {
// 		if (!this.isPlaying) {
// 			this.stopTimer();
// 			this.displayWinner();
// 			return;
// 		}

// 		this.moveAll();
// 		this.draw();
// 		this.anim = requestAnimationFrame(this.play);
// 	};

// 	/** ============================================================
// 	 ** GAME LOGIC
// 	 *============================================================ */
// 	private moveAll() {
// 		this.movePlayer(this.getLocalPlayer());
// 		this.moveBall();
// 	}

// 	private movePlayer(player: any) {
// 		if (!this.network)
// 		{
// 			if (player.movingUp && player.y > 0) player.y -= player.speed;
// 			if (player.movingDown && player.y + 60 < this.canvas.height) player.y += player.speed;
// 			return;
// 		}

// 	}

// 	private moveBall() {
// 		const ball = this.game.ball;

// 		if (ball.y > this.canvas.height || ball.y < 0) {
// 			this.playSound(500, 60);
// 			ball.speed.y *= -1;
// 		}

// 		if (ball.x > this.canvas.width - 5)
// 			this.collide(this.game.player2, this.game.player1);
// 		else if (ball.x < 5)
// 			this.collide(this.game.player1, this.game.player2);

// 		ball.x += ball.speed.x;
// 		ball.y += ball.speed.y;
// 	}

// 	private collide(player: any, otherPlayer: any) {
// 		const ball = this.game.ball;

// 		if (ball.y < player.y || ball.y > player.y + 60) {
// 			this.playSound(300, 300);

// 			this.resetPos();
// 			otherPlayer.score++;

// 			ball.speed.x = player.attraction;

// 			if (otherPlayer.score === this.maxScore) this.isPlaying = false;
// 		} else {
// 			this.playSound(700, 80);
// 			this.modifyBallAngle(player);
// 			this.increaseBallSpeed();
// 		}
// 	}

// 	/** ============================================================
// 	 ** UTILS FUNCTIONS
// 	 *============================================================ */
// 	private randomizeBall() {
// 		const angle = (Math.random() * (Math.PI / 3)) - (Math.PI / 6);
// 		// angle entre -30° et +30°

// 		const speed = 4; // vitesse initiale

// 		this.game.ball.speed.x = Math.cos(angle) * speed * (Math.random() < 0.5 ? -1 : 1);
// 		this.game.ball.speed.y = Math.sin(angle) * speed;
// 	}

// 	private resetPos() {
// 		this.game.player1.y = this.canvas.height / 2 - 30;
// 		this.game.player2.y = this.canvas.height / 2 - 30;
// 		this.game.ball.x = this.canvas.width / 2;
// 		this.game.ball.y = this.canvas.height / 2;

// 		const b = this.game.ball;
// 		b.speed.y = Math.random() * (b.speed.maxY - b.speed.minY) + b.speed.minY;
// 	}

// 	private resetGame() {
// 		this.resetPos();
// 		this.game.player1.score = 0;
// 		this.game.player2.score = 0;
// 		this.draw();
// 	}

// 	private increaseBallSpeed() {
// 		const b = this.game.ball;

// 		const sign = b.speed.x * this.increaseSpeed < 0 ? -1 : 1;

// 		if (Math.abs(b.speed.x * this.increaseSpeed) > b.speed.maxX)
// 			b.speed.x = b.speed.maxX * sign;
// 		else
// 			b.speed.x *= this.increaseSpeed;
// 	}

// 	private modifyBallAngle(player: any) {
// 		const paddleCenter = player.y + 30;
// 		let hitPos = this.game.ball.y - paddleCenter;

// 		const normalized = hitPos / 30;
// 		const bounceAngle = normalized * this.maxAngle;

// 		const speed = Math.sqrt(
// 			this.game.ball.speed.x ** 2 + this.game.ball.speed.y ** 2
// 		);

// 		this.game.ball.speed.y = speed * Math.sin(bounceAngle);
// 	}

// 	private playSound(freq: number, duration: number) {
// 		const o = this.audioCtx.createOscillator();
// 		const g = this.audioCtx.createGain();

// 		o.connect(g);
// 		g.connect(this.audioCtx.destination);

// 		o.type = "square";
// 		o.frequency.value = freq;
// 		g.gain.setValueAtTime(0.1, this.audioCtx.currentTime);

// 		o.start();
// 		o.stop(this.audioCtx.currentTime + duration / 1000);
// 	}

// 	/** ============================================================
// 	 ** DRAW
// 	 *============================================================ */


// 		// score
// 		ctx.font = "40px Verdana";
// 		ctx.textAlign = "center";
// 		ctx.fillText(`${this.game.player1.score}`, this.canvas.width * 0.43, 50);
// 		ctx.fillText(`${this.game.player2.score}`, this.canvas.width * 0.57, 50);
// 	}

// 	/** ============================================================
// 	 ** ENDGAME
// 	 *============================================================ */
// 	private displayWinner() {
// 		const ctx = this.ctx;

// 		ctx.fillStyle = "white";
// 		ctx.font = "40px Arial";
// 		ctx.textAlign = "center";

// 		let winnerId, loserId, winnerText;

// 		if (this.game.player1.score > this.game.player2.score) {
// 			winnerText = "Player 1 Wins!";
// 			winnerId = 1;
// 			loserId = 2;
// 		} else {
// 			winnerText = "Player 2 Wins!";
// 			winnerId = 2;
// 			loserId = 1;
// 		}

// 		ctx.fillText(winnerText, this.canvas.width / 2, this.canvas.height / 2);

// 		this.sendGameResult(
// 			winnerId,
// 			loserId,
// 			this.game.player1.score,
// 			this.game.player2.score,
// 			this.elapsedTime,
// 			this.gameID
// 		);
// 	}

// 	/** ============================================================
// 	 ** API
// 	 *============================================================ */
// 	private async sendGameResult(
// 		winnerId: number,
// 		loserId: number,
// 		winnerScore: number,
// 		loserScore: number,
// 		duration: number,
// 		id: string
// 	) {
// 		try {
// 			const res = await genericFetch("/api/private/game/end", {
// 				method: "POST",
// 				headers: { "Content-Type": "application/json" },
// 				body: JSON.stringify({
// 					winner_id: winnerId,
// 					loser_id: loserId,
// 					winner_score: winnerScore,
// 					loser_score: loserScore,
// 					duration_game: duration,
// 					id: id
// 				})
// 			});

// 			console.log("Saved data:", res);
// 		} catch (err) {
// 			console.error("Error saving game:", err);
// 		}
// 	}

// }
