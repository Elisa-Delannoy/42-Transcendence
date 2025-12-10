import { Server, Socket } from "socket.io";
import { applyInput, GameState, updateBall } from "./gameEngine";
import { ServerGame, games_map, endGame } from "../routes/game/serverGame";
import { gameInfo } from "../server";
import { simulateAI, AI_USER } from "./simulateAI";
const TICK_RATE = 16; //60 FPS (62.5 exactly : 1000ms / 16ms)

export function setupGameServer(io: Server) {
	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		socket.on("joinGame", async (gameId: number) => {
			let game = games_map.get(gameId);

			if (!game)
				return;

			// join room
			socket.join(`game-${gameId}`);

			if (game.isLocal === true)
			{
				if (!game.sockets.player1 && !game.sockets.player2) {
					game.sockets.player1 = socket.id;
					game.sockets.player2 = socket.id;

					game.status = "playing";
					socket.emit("assignRole", "player1");
					io.to(`game-${gameId}`).emit("startGame");
					socket.emit("state", game);
				} else {
					// Already taken (another local session occupying it)
					socket.emit("gameFull");
				}
			}
			else
			{
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
				if ((game.sockets.player1 && game.idPlayer2 == -1) 
					|| (game.sockets.player1 && game.sockets.player2 && game.status === "waiting")) {
					game.status = "playing";
					io.to(`game-${gameId}`).emit("startGame");
				}
	
				// send initial state
				socket.emit("state", game);
	
			}
			
			// Paddle move
			socket.on("input", ({ direction, player }: { direction: "up" | "down" | "stop", player?: "player1" | "player2" }) => {
				const game = games_map.get(gameId);
				if (!game)
					return;

				const actualPlayer = game.isLocal ? player : getPlayer(game, socket);
				if (!actualPlayer)
					return;

				applyInput(game?.state, actualPlayer, direction);
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
				if (game.idPlayer2 === -1)
					simulateAI(game.state as any, Date.now());
				io.to(`game-${game.id}`).emit("state", serializeForClient(game.state));
				checkForWinner(game, io);
			}
		}
	}, TICK_RATE);
}

function checkForWinner(game: ServerGame, io: Server)
{
	if (game.state.score.player2 === game.state.score.max || game.state.score.player1 === game.state.score.max)
		game.status = "finished";

	if (game.status == "finished")
	{
		if (game.state.score.player1 > game.state.score.player2)
		{
			endGame(game.idPlayer1, game.idPlayer2, game.state.score.player1, game.state.score.player2, 5 , game.id, gameInfo);
		}
		else
		{
			endGame(game.idPlayer2, game.idPlayer1, game.state.score.player2, game.state.score.player1, 5 , game.id, gameInfo);
		}
		io.to(`game-${game.id}`).emit("gameOver");
		io.in(`game-${game.id}`).socketsLeave(`game-${game.id}`);
	}
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
