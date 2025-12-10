export interface Ball {
	x: number;
	y: number;
	speedX: number;
	speedY: number;
}

export interface Paddles {
	player1: number;
	player2: number;
}

export interface Score {
	player1: number;
	player2: number;
	max: number;
}

export interface GameState {
	ball: Ball;
	paddles: Paddles;
	score: Score;
	width: number;
	height: number;
}

const paddleWidth = 10;
const paddleHeight = 60;

export function updateBall(game: GameState) {
	// ball movement
	game.ball.x += game.ball.speedX;
	game.ball.y += game.ball.speedY;

	// walls collision
	if (game.ball.y <= 0 || game.ball.y >= game.height) {
		game.ball.speedY *= -1;
	}

	// paddles collision
	if (game.ball.x <= paddleWidth &&
		game.ball.y >= game.paddles.player1 &&
		game.ball.y <= game.paddles.player1 + paddleHeight) {
		increaseBallSpeed(game.ball);
	}

	if (game.ball.x >= game.width - paddleWidth &&
		game.ball.y >= game.paddles.player2 &&
		game.ball.y <= game.paddles.player2 + paddleHeight) {
		increaseBallSpeed(game.ball);
	}

	// Score
	if (game.ball.x <= 0) {
		game.score.player2++;
		resetBall(game);
		game.ball.speedX = -2.5;
		resetPaddles(game);
	}
	if (game.ball.x >= game.width) {
		game.score.player1++;
		resetBall(game);
		game.ball.speedX = 2.5;
		resetPaddles(game);
	}
}

export function resetBall(game: GameState) {
	game.ball.x = game.width / 2;
	game.ball.y = game.height / 2;
	game.ball.speedY = (Math.random() - 0.5) * 2;
}

export function resetPaddles(game: GameState) {
	game.paddles.player1 = game.height / 2;
	game.paddles.player2 = game.height / 2;
}

function increaseBallSpeed(ball: Ball)
{
	if (ball.speedX > -8 && ball.speedX < 8)
		ball.speedX *= 1.15;
	ball.speedX *= -1;
}

export function applyInput(
	game: GameState,
	player: "player1" | "player2",
	direction: "up" | "down" | "stop"
) {
	const speed = 1.5;

	if (direction === "up" && game.paddles[player] > 0)
		game.paddles[player] -= speed;

	if (direction === "down" && game.paddles[player] < (game.height - paddleHeight))
		game.paddles[player] += speed;
}
