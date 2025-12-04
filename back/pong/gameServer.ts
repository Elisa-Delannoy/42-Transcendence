import { Server, Socket } from "socket.io";
import { applyInput, GameState, updateBall } from "./gameEngine";
import { ServerGame, games_map } from "../routes/game/game";

const TICK_RATE = 16;

export function setupGameServer(io: Server) {
	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		socket.on("joinGame", (gameId: number) => {
			let game = games_map.get(gameId);

			// Si pas existant, créer une partie
			if (!game) {
				game = new ServerGame(gameId);
				games_map.set(gameId, game);
			}

			socket.join(`game-${gameId}`);

			// Assignation automatique
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

			// Démarrer la game si 2 joueurs présents
			if (game.sockets.player1 && game.sockets.player2 && game.status === "waiting") {
				game.status = "playing";
				io.to(`game-${gameId}`).emit("startGame");
			}

			// Envoi de l'état initial
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
				if (game!.sockets.player1 === socket.id) game!.sockets.player1 = null;
				if (game!.sockets.player2 === socket.id) game!.sockets.player2 = null;
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
