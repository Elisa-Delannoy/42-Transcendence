import { Server, Socket } from "socket.io";
import { applyInput, GameState, updateBall } from "./gameEngine";
import { ServerGame, games_map } from "../routes/game/serverGame";

const TICK_RATE = 16; //60 FPS (62.5 exactly : 1000ms / 16ms)

export function setupGameServer(io: Server) {
	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		socket.on("joinGame", (gameId: number) => {
			let game = games_map.get(gameId);

			// create game if doesn't exist
			if (!game) {
				game = new ServerGame(gameId);
				games_map.set(gameId, game);
			}

			// join room
			socket.join(`game-${gameId}`);

			// automatic assignation
			let role: "player1" | "player2";
			if (!game.sockets.player1) {
				game.sockets.player1 = socket.id;
				role = "player1";
			} else if (!game.sockets.player2 && game.sockets.player1 !== socket.id) {
				game.sockets.player2 = socket.id;
				role = "player2";
			} else if (game.sockets.player1 === socket.id) {
				role = "player1";
			} else if (game.sockets.player2 === socket.id) {
				role = "player2";
			} else {
				socket.emit("gameFull");
				return;
			}

			socket.emit("assignRole", role);

			// start game when 2 players are in the game
			if (game.sockets.player1 && game.sockets.player2 && game.status === "waiting") {
				game.status = "playing";
				io.to(`game-${gameId}`).emit("startGame");
			}

			// send initial state
			socket.emit("state", game);

			// Paddle move
			socket.on("input", ({ direction }) => {
				const game = games_map.get(gameId);
				if (!game)
					return;

				const player = getPlayer(game, socket);
				if (!player)
					return;

				if (player === "player1" || player === "player2")
					applyInput(game?.state, player, direction);
			});

			// Disconnect
			socket.on("disconnect", () => {
				if (game!.sockets.player1 === socket.id)
					game!.sockets.player1 = null;

				if (game!.sockets.player2 === socket.id)
					game!.sockets.player2 = null;
				console.log("Client disconnected:", socket.id);
			});
		});
	});

	// Tick loop
	setInterval(() => {
		for (const game of games_map.values()) {
			if (game.status === "playing") {
				updateBall(game.state);
				io.to(`game-${game.id}`).emit("state", serializeForClient(game.state));
			}
		}
	}, TICK_RATE);
}

function serializeForClient(state: GameState) {
	return {
		ball: { x: state.ball.x, y: state.ball.y },
		paddles: state.paddles,
		score: state.score
	};
}

function getPlayer(game: ServerGame, socket: Socket) {
	if (game.sockets.player1 === socket.id) return "player1";
	if (game.sockets.player2 === socket.id) return "player2";
	return null;
}
