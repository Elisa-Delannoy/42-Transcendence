import { Server, Socket } from "socket.io";
import { applyInput, GameState, resetBall } from "./gameEngine";
import { ServerGame, games_map, endGame } from "../routes/game/serverGame";
import { gameInfo } from "../server";
import { Users } from "../DB/users";
import { TournamentInstance, tournaments_map } from "../routes/tournament/tournamentInstance";

export function setupGameServer(io: Server, users: Users) {
	io.on("connection", (socket) => {
		console.log("Client connected:", socket.id);

		socket.on("joinGame", async (gameId: number, playerId: number) => {
			let game = games_map.get(gameId);
			
			if (!game)
				return;

			//add io (server) to game
			game.setIo(io);
			const pseudo = await users.getPseudoFromId(playerId);
			// join room
			socket.join(`game-${gameId}`);

			if (game.disconnectTimer) {
				clearTimeout(game.disconnectTimer);
				game.disconnectTimer = null;
			}

			if (game.isLocal === true)
				initLocal(game, io, socket, gameId, pseudo.pseudo);
			else
				initRemoteAndAi(game, io, socket, gameId, playerId, pseudo.pseudo);

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

				game.status = "disconnected";
				io.to(`game-${gameId}`).emit("state", serializeForClient(game.state, game.status));
				io.to(`game-${game.id}`).emit("disconnection", serializeForClient(game.state, game.status));

				if (!game.disconnectTimer) {
					game.disconnectTimer = setTimeout(() => {
						console.log("Timeout disconnected game : ", gameId);
						io.to(`game-${game.id}`).emit("noReconnection");
						games_map.delete(gameId);
					}, 5 * 60 * 1000);
				}
			});
		});


		socket.on("joinTournament", async (tournamentId: number, playerId: number) => {
			let tournament = tournaments_map.get(tournamentId);
			
			if (!tournament || playerId === undefined)
				return;

			tournament.setIo(io);
			const pseudo = await users.getPseudoFromId(playerId);

			// join room
			socket.join(`tournament-${tournamentId}`);

			if (tournament.disconnectTimer) {
				clearTimeout(tournament.disconnectTimer);
				tournament.disconnectTimer = null;
			}

			fillSocketTournament(playerId, tournament, socket, pseudo);

			io.to(`tournament-${tournamentId}`).emit("tournamentPlayersUpdate", tournament.idPlayers, tournament.pseudoPlayers);

			socket.on("disconnect", () => {
				let tournament = tournaments_map.get(tournamentId);
				if (!tournament)
					return;

				console.log("Client disconnected:", socket.id);

				removeSocketTournament(tournament, socket, pseudo);
				io.to(`tournament-${tournamentId}`).emit("tournamentPlayersUpdate", tournament.idPlayers, tournament.pseudoPlayers);

				if (!tournament.disconnectTimer) {
					tournament.disconnectTimer = setTimeout(() => {
						console.log("Timeout disconnected game : ", tournamentId);
						io.to(`tournament-${tournament.id}`).emit("noReconnection");
						tournaments_map.delete(tournamentId);
					}, 5 * 60 * 1000);
				}

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
	}
}

export function serializeForClient(state: GameState, status: "waiting" | "playing" | "finished" | "countdown" | "disconnected") {
	return {
		ball: { x: state.ball.x, y: state.ball.y },
		paddles: state.paddles,
		score: state.score,
		status: status,
		pseudo: { player1: state.pseudo.player1, player2: state.pseudo.player2 }
	};
}

function initLocal(game: ServerGame, io: Server, socket: Socket, gameId: number, pseudo: string) {
	if (!game.sockets.player1 && !game.sockets.player2)
	{
		game.sockets.player1 = socket.id;
		game.sockets.player2 = socket.id;
		game.idPlayer2 = 1;
		game.state.pseudo.player1 = pseudo;
		game.state.pseudo.player2 = "Guest";
		if (game.status !== "disconnected")
		{
			game.state.ball.speedX = Math.random() < 0.5 ? -2.5 : 2.5;
			resetBall(game.state);
		}

		game.status = "countdown";
		socket.emit("assignRole", "player1");

		io.to(`game-${gameId}`).emit("state", serializeForClient(game.state, game.status));
		
		//countdown starting
		io.to(`game-${gameId}`).emit("startCountdown", serializeForClient(game.state, game.status));
		//predraw canvas without score to avoid empty screen before countdown
		socket.emit("predraw", serializeForClient(game.state, game.status));
	}
	else
	{
		// Already taken (another local session occupying it) => UNUSED SO FAR
		socket.emit("gameFull");
	}
}

async function initRemoteAndAi(game: ServerGame, io: Server, socket: Socket, gameId: number, playerId: number, pseudo: string) {
	
	let role: "player1" | "player2";

	if (playerId === game.idPlayer1)
	{
		role = "player1";
		game.sockets.player1 = socket.id;
		game.state.pseudo.player1 = pseudo;
	}
	else if (playerId === game.idPlayer2)
	{
		role = "player2";
		game.sockets.player2 = socket.id;
		game.state.pseudo.player2 = pseudo;
		io.to(`game-${gameId}`).emit("state", serializeForClient(game.state, game.status));
	}
	else
	{
		socket.emit("gameFull"); // => UNUSED SO FAR
		return;
	}
	socket.emit("assignRole", role);

	if (game.status !== "disconnected")
	{
		game.state.ball.speedX = Math.random() < 0.5 ? -2.5 : 2.5;
		resetBall(game.state);
	}

	if (game.idPlayer2 == -1)
		game.state.pseudo.player2 = "AI";

	// start countdown when 2 players are in the game
	if ((game.sockets.player1 && game.idPlayer2 == -1) 
		|| (game.sockets.player1 && game.sockets.player2 && (game.status === "waiting" || game.status === "disconnected"))) {
		game.status = "countdown";
		io.to(`game-${gameId}`).emit("state", serializeForClient(game.state, game.status));
		io.to(`game-${gameId}`).emit("startCountdown", serializeForClient(game.state, game.status));
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

function fillSocketTournament(playerId: Number, tournament: TournamentInstance, socket: Socket, pseudo: any)
{
	if (playerId === tournament.idPlayers[0])
	{
		tournament.sockets.player1 = socket.id;
		tournament.pseudoPlayers[0] = pseudo.pseudo;
	}
	else if (playerId === tournament.idPlayers[1])
	{
		tournament.sockets.player2 = socket.id;
		tournament.pseudoPlayers[1] = pseudo.pseudo;
	}
	else if (playerId === tournament.idPlayers[2])
	{
		tournament.sockets.player3 = socket.id;
		tournament.pseudoPlayers[2] = pseudo.pseudo;
	}
	else if (playerId === tournament.idPlayers[3])
	{
		tournament.sockets.player4 = socket.id;
		tournament.pseudoPlayers[3] = pseudo.pseudo;
	}
	else
	{
		console.log("oupsi");
		return;
	}
}

function removeSocketTournament(tournament: TournamentInstance, socket: Socket, pseudo: any)
{
	if (tournament.sockets.player1 === socket.id)
		tournament.sockets.player1 = null;

	if (tournament.sockets.player2 === socket.id)
		tournament.sockets.player2 = null;

	if (tournament.sockets.player3 === socket.id)
		tournament.sockets.player3 = null;

	if (tournament.sockets.player4 === socket.id)
		tournament.sockets.player4 = null;

	for (let i = 0; i < 4; i++)
	{
		if (tournament.pseudoPlayers[i] == pseudo.pseudo)
			tournament.pseudoPlayers[i] = "Waiting for player..."
	}
}