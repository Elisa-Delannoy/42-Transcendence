import { Server, Socket } from "socket.io";
import { applyInput, GameState, resetBall } from "./gameEngine";
import { ServerGame, games_map, endGame } from "../routes/game/serverGame";
import { gameInfo } from "../server";

export function setupGameServer(io: Server) {
	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		socket.on("joinGame", async (gameId: number) => {
			let game = games_map.get(gameId);

			if (!game)
				return;

			//add io (server) to game
			game.setIo(io);

			// join room
			socket.join(`game-${gameId}`);

			if (game.isLocal === true)
				initLocal(game, io, socket, gameId);
			else
				initRemoteAndAi(game, io, socket, gameId);

			//after countdown, match is starting
			socket.on("startGame", () => {
				const game = games_map.get(gameId);
				if (!game)
					return;
				game.status = "playing";
				socket.emit("state", serializeForClient(game.state, game.status));
			});

			// Input
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
				const game = games_map.get(gameId);
				if (!game)
					return;
				
				console.log("Client disconnected:", socket.id);

				if (game!.sockets.player1 === socket.id)
					game!.sockets.player1 = null;

				if (game!.sockets.player2 === socket.id)
					game!.sockets.player2 = null;

				if (game.status == "playing")
					game.status = "waiting";
			});
		});
	});
}

export function checkForWinner(game: ServerGame, io: Server)
{
	if (game.state.score.player2 === game.state.score.max || game.state.score.player1 === game.state.score.max)
		game.status = "finished";

	if (game.status == "finished")
	{
		if (game.intervalId) {
			clearInterval(game.intervalId);
		}
		const duration = (Date.now() - game.duration) / 1000;
		game.duration = Math.round(duration * 10) / 10;
		if (game.state.score.player1 > game.state.score.player2)
		{
			endGame(game.idPlayer1, game.idPlayer2, game.state.score.player1, game.state.score.player2, game.duration , game.id, gameInfo, game.type);
		}
		else
		{
			endGame(game.idPlayer2, game.idPlayer1, game.state.score.player2, game.state.score.player1, game.duration , game.id, gameInfo, game.type);
		}
		io.to(`game-${game.id}`).emit("gameOver");
		io.in(`game-${game.id}`).socketsLeave(`game-${game.id}`);
		console.log("function checkforwinner done");
	}
}

export function serializeForClient(state: GameState, status: "waiting" | "playing" | "finished" | "countdown") {
	return {
		ball: { x: state.ball.x, y: state.ball.y },
		paddles: state.paddles,
		score: state.score,
		status: status
	};
}

function initLocal(game: ServerGame, io: Server, socket: Socket, gameId: number) {
	if (!game.sockets.player1 && !game.sockets.player2)
	{
		game.sockets.player1 = socket.id;
		game.sockets.player2 = socket.id;
		game.idPlayer2 = 1;

		game.status = "countdown";
		game.type = "Local";

		game.state.ball.speedX = Math.random() < 0.5 ? -2.5 : 2.5;
		resetBall(game.state);

		socket.emit("assignRole", "player1");

		//countdown starting
		io.to(`game-${gameId}`).emit("startCountdown");
		//predraw canvas without score to avoid empty screen before countdown
		socket.emit("predraw", serializeForClient(game.state, game.status));
	}
	else
	{
		// Already taken (another local session occupying it) => UNUSED SO FAR
		socket.emit("gameFull");
	}
}

function initRemoteAndAi(game: ServerGame, io: Server, socket: Socket, gameId: number) {
	// automatic assignation
	let role: "player1" | "player2";
	if (!game.sockets.player1)
	{
		game.sockets.player1 = socket.id;
		role = "player1";
	}
	else if (!game.sockets.player2 && game.sockets.player1 !== socket.id)
	{
		game.sockets.player2 = socket.id;
		role = "player2";
	}
	else if (game.sockets.player1 === socket.id)
	{
		role = "player1";
	}
	else if (game.sockets.player2 === socket.id)
	{
		role = "player2";
	}
	else
	{
		socket.emit("gameFull"); // => UNUSED SO FAR
		return;
	}
	socket.emit("assignRole", role);

	if (game.idPlayer2 != -1)
		game.type = "Online";

	game.state.ball.speedX = Math.random() < 0.5 ? -2.5 : 2.5;
	resetBall(game.state);

	// start countdown when 2 players are in the game
	if ((game.sockets.player1 && game.idPlayer2 == -1) 
		|| (game.sockets.player1 && game.sockets.player2 && game.status === "waiting")) {
		game.status = "countdown";
		io.to(`game-${gameId}`).emit("startCountdown");
	}

	//predraw canvas without score to avoid empty screen before countdown
	socket.emit("predraw", serializeForClient(game.state, game.status));
}

function getPlayer(game: ServerGame, socket: Socket) {
	if (game.sockets.player1 === socket.id)
		return "player1";

	if (game.sockets.player2 === socket.id)
		return "player2";

	return null;
}
