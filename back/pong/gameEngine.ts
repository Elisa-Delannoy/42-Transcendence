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
	aiLastUpdate: number;
	inputs: {
		player1: "up" | "down" | "stop",
		player2: "up" | "down" | "stop"
	};
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
		modifyBallAngle(game.paddles.player1, game.ball);
		increaseBallSpeed(game.ball);
	}

	if (game.ball.x >= game.width - paddleWidth &&
		game.ball.y >= game.paddles.player2 &&
		game.ball.y <= game.paddles.player2 + paddleHeight) {
		modifyBallAngle(game.paddles.player2, game.ball);
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

function modifyBallAngle(player: number, ball: Ball) {
	const paddleCenter = player + 30;
	let hitPos = ball.y - paddleCenter;

	const normalized = hitPos / 30;
	const bounceAngle = normalized * (Math.PI / 4);

	const speed = Math.sqrt(
		ball.speedX ** 2 + ball.speedY ** 2
	);

	ball.speedY = speed * Math.sin(bounceAngle);
}

export function resetBall(game: GameState) {
	game.ball.x = game.width / 2;
	game.ball.y = game.height / 2;
	game.ball.speedY = (Math.random() - 0.5) * 2;
}

export function resetPaddles(game: GameState) {
	game.paddles.player1 = game.height / 2 - 30;
	game.paddles.player2 = game.height / 2 - 30;
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
	game.inputs[player] = direction;
}

export function updatePaddles(game: GameState, deltaTime: number) {
	const speed = 450; // pixels / seconde

	if (game.aiLastUpdate != 0)
	{
		if (game.inputs.player1 === "up")
			game.paddles.player1 -= speed * deltaTime;
			
		if (game.inputs.player1 === "down")
			game.paddles.player1 += speed * deltaTime;

		// clamp
		game.paddles.player1 = Math.max(
			0,
			Math.min(game.height - paddleHeight, game.paddles.player1)
		);

		if (game.inputs.player2 === "up")
			game.paddles.player2 -= (speed * deltaTime) / 2;
			
		if (game.inputs.player2 === "down")
			game.paddles.player2 += (speed * deltaTime) / 2;

		// clamp
		game.paddles.player2 = Math.max(
			0,
			Math.min(game.height - paddleHeight, game.paddles.player2)
		);
	}
	else
	{
		for (const player of ["player1", "player2"] as const) {
			if (game.inputs[player] === "up")
				game.paddles[player] -= speed * deltaTime;
			
			if (game.inputs[player] === "down")
				game.paddles[player] += speed * deltaTime;

			// clamp
			game.paddles[player] = Math.max(
				0,
				Math.min(game.height - paddleHeight, game.paddles[player])
			);
		}
	}
}
