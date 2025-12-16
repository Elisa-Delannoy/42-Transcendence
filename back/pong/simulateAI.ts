import { applyInput, GameState } from "./gameEngine";

const AI_REFRESH_INTERVAL = 1; // AI refresh interval in milliseconds (once per second)
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
		aiTargetY = predictBallY(game) + (Math.random() * 50 - 10);
	}
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
}

// export function simulateAI(game: GameState & { aiLastUpdate?: number }, timestamp?: number) {
//     const now = timestamp || Date.now();

//     // Control AI update frequency to simulate reaction time
//     if (game.aiLastUpdate && now - game.aiLastUpdate < 20) return;
//     game.aiLastUpdate = now;

//     // AI miss chance
//     const missChance = 0.1; // 10% chance to make a mistake
//     if (Math.random() < missChance) {
//         applyInput(game, "player2", "stop");
//         return;
//     }
    // Simplified ball prediction + random error
    // aiTargetY = predictBallY(game) + (Math.random() * 80 - 20); // +-20px random offset
    // if (aiTargetY !== null) {
    //     const paddleCenter = game.paddles.player2 + 30; // paddleHeight/2
    //     const diff = aiTargetY - paddleCenter;
    //     // AI speed adapts to ball speed
    //     const baseSpeed = 3; // minimal paddle speed per update
    //     const adaptiveSpeed = Math.min(baseSpeed + Math.abs(game.ball.speedX), 6); // cap at 6px per update

    //     if (Math.abs(diff) < 5) {
    //         applyInput(game, "player2", "stop");
    //     } else if (diff > 0) {
    //         // Move paddle down
    //         game.paddles.player2 += Math.min(diff, adaptiveSpeed);
    //         if (game.paddles.player2 > game.height - 60) game.paddles.player2 = game.height - 60;
    //     } else {
    //         // Move paddle up
    //         game.paddles.player2 += Math.max(diff, -adaptiveSpeed);
    //         if (game.paddles.player2 < 0) game.paddles.player2 = 0;
    //     }
    // }

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
