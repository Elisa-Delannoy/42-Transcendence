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
}

export interface GameState {
	ball: Ball;
	paddles: Paddles;
	score: Score;
	width: number;
	height: number;
}

export function updateBall(game: GameState) {
	// 1️⃣ Déplacement
	game.ball.x += game.ball.speedX;
	game.ball.y += game.ball.speedY;

	// 2️⃣ Collision murs
	if (game.ball.y <= 0 || game.ball.y >= game.height) {
		game.ball.speedY *= -1;
	}

	// 3️⃣ Collision paddles
	const paddleWidth = 10;
	const paddleHeight = 60;

	if (game.ball.x <= paddleWidth &&
		game.ball.y >= game.paddles.player1 &&
		game.ball.y <= game.paddles.player1 + paddleHeight) {
		game.ball.speedX *= -1;
	}

	if (game.ball.x >= game.width - paddleWidth &&
		game.ball.y >= game.paddles.player2 &&
		game.ball.y <= game.paddles.player2 + paddleHeight) {
		game.ball.speedX *= -1;
	}

	// 4️⃣ Score
	if (game.ball.x <= 0) {
		game.score.player2++;
		resetBall(game);
	}
	if (game.ball.x >= game.width) {
		game.score.player1++;
		resetBall(game);
	}
}

export function resetBall(game: GameState) {
	game.ball.x = game.width / 2;
	game.ball.y = game.height / 2;
	game.ball.speedX = Math.random() < 0.5 ? 2 : -2;
	game.ball.speedY = (Math.random() - 0.5) * 2;
}

export function applyInput(
	game: GameState,
	player: "player1" | "player2",
	direction: "up" | "down" | "stop"
) {
	const speed = 5;

	if (direction === "up")
		game.paddles[player] -= speed;

	if (direction === "down")
		game.paddles[player] += speed;
}
