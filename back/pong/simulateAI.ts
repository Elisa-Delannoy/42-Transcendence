import { applyInput, GameState } from "./gameEngine";

const AI_REFRESH_INTERVAL = 0.5;

/**
 * Simulate AI as Player 2
 */

export function simulateAI(game: GameState & { aiLastUpdate?: number }, deltaTime: number) {
	// Only update AI decision once per second
	if (!game.aiLastUpdate) game.aiLastUpdate = 0;
	// Only update AI decision once per second
	const missChance = 0.1; // 10% chance to make a mistake
	if (Math.random() < missChance) {
		applyInput(game, "player2", "stop");
		return;
	}
	game.aiLastUpdate += deltaTime;
	if (game.aiLastUpdate >= AI_REFRESH_INTERVAL) {
		game.aiLastUpdate = 0;
		game.aiTargetY = predictBallY(game) + (Math.random() * 50 - 10);
	}
	if (game.aiTargetY !== null) {
        const paddleCenter = game.paddles.player2 + 30; // paddleHeight/2
        if (Math.abs(game.aiTargetY - paddleCenter) < 5) {
            applyInput(game, "player2", "stop");
        } else if (game.aiTargetY > paddleCenter) {
            applyInput(game, "player2", "down");
        } else {
            applyInput(game, "player2", "up");
        }
    }
}

/**
 * Predict the future Y position of the ball when it reaches the AI paddle
 * (considers wall bounces)
 */
function predictBallY(game: GameState): number {
	const { x: ballX, y: ballY, speedX, speedY } = game.ball;
	const paddleX = game.width - 10;
	const height = game.height;

	if (speedX <= 0) {
		return game.paddles.player2 + 30;
	}
	const distanceX = paddleX - ballX;
	const timeToReach = distanceX / speedX;
	let projectedY = ballY + speedY * timeToReach;

	const period = height * 2;
	projectedY = projectedY % period;
	if (projectedY < 0) projectedY += period;
	if (projectedY > height) projectedY = period - projectedY;

	return projectedY;
}
