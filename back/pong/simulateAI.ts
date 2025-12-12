import { applyInput, GameState } from "./gameEngine";

const AI_REFRESH_INTERVAL = 1000; // AI refresh interval in milliseconds (once per second)
let aiTargetY: number | null = null; 

export const AI_USER = {
    id: -1,
    pseudo: "AI_Player",
    avatar: "ai.png",
};
/**
 * Simulate AI as Player 2
 * @param game GameState
 * @param timestamp Current timestamp in milliseconds
 */
export function simulateAI(game: GameState & { aiLastUpdate?: number }, timestamp: number) {
	// Only update AI decision once per second
	if (!game.aiLastUpdate) game.aiLastUpdate = 0;
	// Only update AI decision once per second
	game.aiLastUpdate = timestamp;
    aiTargetY = predictBallY(game) + (Math.random() * 50 - 10);
	if (aiTargetY !== null) {
        const paddleCenter = game.paddles.player2 + 30; // paddleHeight/2
        if (Math.abs(aiTargetY - paddleCenter) < 5) {
            applyInput(game, "player2", "stop");
        } else if (aiTargetY > paddleCenter) {
            applyInput(game, "player2", "down");
        } else {
            applyInput(game, "player2", "up");
        }
    }
	// TODO: Power-up usage logic if implemented
	// maybeUsePowerUp(game);
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
