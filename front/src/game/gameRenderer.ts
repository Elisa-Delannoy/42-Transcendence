import { GameState } from "./gameNetwork";

export class GameRenderer {
	private canvas: HTMLCanvasElement;
	private ctx: CanvasRenderingContext2D;

	constructor() {
		this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
		this.ctx = this.canvas.getContext("2d")!;
	}

	public draw(state: GameState) {
		this.clear();

		if (state.paddles)
			this.drawPaddles(state.paddles);

		if (state.ball)
			this.drawBall(state.ball);

		if (state.score)
			this.drawScore(state.score);
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
			this.ctx.fillRect(10, paddles.player1, 10, 60);

		if (paddles.player2 !== undefined)
			this.ctx.fillRect(this.canvas.width - 20, paddles.player2, 10, 60);
	}

	private drawScore(score: { player1: number; player2: number }) {
		this.ctx.fillStyle = "white";
		this.ctx.font = "40px Verdana";
		this.ctx.fillText(`${score.player1} - ${score.player2}`, this.canvas.width/2 - 20, 50);
	}
}
