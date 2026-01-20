import { GameState } from "./gameNetwork";

export class GameRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private paddleWidth: number;
	private paddleHeight: number;
	private paddleImgs: {
		player1: HTMLImageElement;
		player2: HTMLImageElement;
	};

	constructor() {
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d")!;
		this.paddleWidth = 20;
		this.paddleHeight = 100;
		this.paddleImgs = {
			player1: new Image(),
			player2: new Image(),
		};
		this.paddleImgs.player1.src = "/src/image/croissant-player1.png";
		this.paddleImgs.player2.src = "/src/image/croissant-player2.png";
	}

	public drawCountdown(state: GameState, countdown: number) {
		this.draw(state, false);

		if (countdown > 0)
		{
			this.ctx.font = "80px Arial";
			this.ctx.fillStyle = "white";
			this.ctx.textAlign = "center";
			if (countdown > 1)
			{
				countdown--;
				this.ctx.fillText(
					countdown.toString(),
					this.canvas.width / 2,
					this.canvas.height / 2
				);
			}
			else
			{
				this.ctx.fillText(
					"GO!",
					this.canvas.width / 2,
					this.canvas.height / 2
				);
			}
		}
	}

	public drawReconnection() {
		this.drawCanvas();
		this.ctx.font = "30px Arial";
		this.ctx.fillStyle = "white";
		this.ctx.textAlign = "center";
		const text = "A player has been disconnected,\nwaiting a few seconds for reconnection...\n";

		const lines = text.split("\n");
		const lineHeight = 24;

		lines.forEach((line, i) => {
			this.ctx.fillText(
				line,
				this.canvas.width / 2,
				this.canvas.height / 2 + (i * lineHeight)
			);
		});
	}

	public drawGameOver(state: GameState) {
		this.ctx.fillStyle = "black";
		this.canvas.height = this.canvas.height / 2;
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
		if (state.score)
		{
			this.drawScore(state.score);
			this.ctx.font = "60px Arial";
			this.ctx.fillStyle = "white";
			this.ctx.textAlign = "center";
			if (state.score.player1 > state.score.player2)
			{
				const pseudo = state.users.user1.pseudo;
				const str = pseudo + " wins!";
				this.ctx.fillText(
					str,
					this.canvas.width / 2,
					this.canvas.height * .75
				);
			}
			else
			{
				const pseudo = state.users.user2.pseudo;
				const str = pseudo + " wins!";
				this.ctx.fillText(
					str,
					this.canvas.width / 2,
					this.canvas.height * .75
				);
			}
		}
	}

	public draw(state: GameState, drawScore: boolean) {
		this.clear();

		if (state.paddles)
			this.drawPaddles(state.paddles);

		if (state.ball)
			this.drawBall(state.ball);

		if (drawScore)
		{
			if (state.score)
				this.drawScore(state.score);
		}
	}

	private clear() {
		this.drawCanvas();
		this.drawMiddleLine();
	}

	private drawCanvas() {
		this.ctx.fillStyle = "black";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
	}

	private drawMiddleLine() {
		this.ctx.strokeStyle = "white";
		this.ctx.beginPath();
		this.ctx.moveTo(this.canvas.width / 2, 0);
		this.ctx.lineTo(this.canvas.width / 2, this.canvas.height);
		this.ctx.stroke();
	}

	private drawBall(ball: { x: number; y: number }) {
		this.ctx.fillStyle = "white";
		this.ctx.beginPath();
		this.ctx.arc(ball.x, ball.y, 7, 0, Math.PI * 2);
		this.ctx.fill();
	}

	private drawPaddles(paddles: { player1?: number; player2?: number }) {
		this.ctx.fillStyle = "white";

		if (paddles.player1 !== undefined)
		{
			if (this.paddleImgs.player1.complete && this.paddleImgs.player1.naturalWidth !== 0)
				this.ctx.drawImage(this.paddleImgs.player1, 0, paddles.player1, this.paddleWidth, this.paddleHeight);
			else
				this.ctx.fillRect(0, paddles.player1, this.paddleWidth, this.paddleHeight);
		}

		if (paddles.player2 !== undefined)
		{
			if (this.paddleImgs.player2.complete && this.paddleImgs.player2.naturalWidth !== 0)
				this.ctx.drawImage(this.paddleImgs.player2, this.canvas.width - 20, paddles.player2, this.paddleWidth, this.paddleHeight);
			else
				this.ctx.fillRect(this.canvas.width - 20, paddles.player2, this.paddleWidth, this.paddleHeight);
		}
	}

	private drawScore(score: { player1: number; player2: number }) {
		this.ctx.fillStyle = "white";
		this.ctx.font = "40px Verdana";
		this.ctx.textAlign = "center";
		this.ctx.fillText(`${score.player1}`, this.canvas.width * 0.43, 50);
		this.ctx.fillText(`${score.player2}`, this.canvas.width * 0.57, 50);
	}
}
