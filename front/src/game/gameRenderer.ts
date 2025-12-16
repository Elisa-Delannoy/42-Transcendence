import { GameState } from "./gameNetwork";

export class GameRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;
	private paddleWidth: number;
	private paddleHeight: number;

	constructor() {
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d")!;
		this.paddleWidth = 10;
		this.paddleHeight = 60;
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
				this.ctx.fillText(
					"Player1 wins!",
					this.canvas.width / 2,
					this.canvas.height * .75
				);
			}
			else
			{
				this.ctx.fillText(
					"Player2 wins!",
					this.canvas.width / 2,
					this.canvas.height * .75
				);
			}
		}
		document.getElementById("buttons")?.classList.remove("hidden");

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
		this.ctx.arc(ball.x, ball.y, 5, 0, Math.PI * 2);
		this.ctx.fill();
	}

	private drawPaddles(paddles: { player1?: number; player2?: number }) {
		this.ctx.fillStyle = "white";

		if (paddles.player1 !== undefined)
			this.ctx.fillRect(0, paddles.player1, this.paddleWidth, this.paddleHeight);

		if (paddles.player2 !== undefined)
		{
			this.ctx.fillStyle = "#6B8AA4";
			this.ctx.fillRect(this.canvas.width - 10, paddles.player2, this.paddleWidth, this.paddleHeight);
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
