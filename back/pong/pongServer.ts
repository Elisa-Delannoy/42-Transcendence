import { Server, Socket } from "socket.io";
import { applyInput, GameState, resetBall } from "./gameEngine";
import { ServerGame, games_map, endGame } from "../routes/game/serverGame";
import { gameInfo, users } from "../server";
import { Users } from "../DB/users";
import { serverTournament, tournaments_map } from "../routes/tournament/serverTournament";
import { TournamentState } from "../../front/src/tournament/tournamentNetwork";

export function setupGameServer(io: Server, socket: Socket) {


		socket.on("joinGame", async (gameId: number, playerId: number, tournamentId: number) => {
			let tournament = tournaments_map.get(tournamentId);
			let game;
			if (tournament)
			{
				game = tournament.games.get(gameId);
			}
			else
			{
				game = games_map.get(gameId);
			}
			if (!game)
				return;

			//add io (server) to game
			game.setIo(io);
			const pseudo = socket.data.pseudo;
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
				let tournament = tournaments_map.get(tournamentId);
				let game;
				if (tournament)
				{
					game = tournament.games.get(gameId);
				}
				else
				{
					game = games_map.get(gameId);
				}
				if (!game)
					return;
				game.status = "playing";
				socket.emit("state", updateStateGame(game.state, game.status));
			});

			// Input
			socket.on("input", ({ direction, player }: { direction: "up" | "down" | "stop", player?: "player1" | "player2" }) => {
				let tournament = tournaments_map.get(tournamentId);
				let game;
				if (tournament)
				{
					game = tournament.games.get(gameId);
				}
				else
				{
					game = games_map.get(gameId);
				}
				if (!game)
					return;

				const actualPlayer = game.isLocal ? player : getPlayer(game, socket);
				if (!actualPlayer)
					return;

				applyInput(game?.state, actualPlayer, direction);
			});

			// Disconnect
			socket.on("disconnect", () => {
				let tournament = tournaments_map.get(tournamentId);
				let game;
				if (tournament)
				{
					game = tournament.games.get(gameId);
				}
				else
				{
					game = games_map.get(gameId);
				}
				if (!game)
					return;

				console.log("Client disconnected:", socket.id);

				if (game!.sockets.player1 === socket.id)
					game!.sockets.player1 = null;

				if (game!.sockets.player2 === socket.id)
					game!.sockets.player2 = null;

				game.status = "disconnected";
				io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status));
				io.to(`game-${game.id}`).emit("disconnection", updateStateGame(game.state, game.status));

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

			fillSocketTournament(playerId, tournament, socket, pseudo.pseudo);

			updateBrackets(tournament);
			io.to(`tournament-${tournamentId}`).emit("state", updateStateTournament(tournament.state));
			if (playerId == tournament.idPlayers[0])
			{
				if (tournament.state.status === "waiting")
					io.to(`tournament-${tournamentId}`).emit("hostTournament", playerId);
			}

			socket.on("disconnect", () => {
				let tournament = tournaments_map.get(tournamentId);
				if (!tournament)
					return;

				console.log("Client disconnected:", socket.id);

				removeSocketTournament(tournament, socket);

				io.to(`tournament-${tournamentId}`).emit("state", updateStateTournament(tournament.state));

				//disconnect player from tournament after 5 minutes
				if (!tournament.disconnectTimer) {
					tournament.disconnectTimer = setTimeout(() => {
						console.log("Timeout disconnected game : ", tournamentId);
						io.to(`tournament-${tournamentId}`).emit("state", updateStateTournament(tournament.state));
						tournaments_map.delete(tournamentId);
					}, 5 * 60 * 1000);
				}

			});

			socket.on("startTournament", () => {
				let tournament = tournaments_map.get(tournamentId);
				if (!tournament)
					return;
				tournament.state.status = "semifinal";
				if (tournament.idPlayers[0] === 1)
					tournament.state.pseudo.player1 = "AI";
				if (tournament.idPlayers[1] === 1)
					tournament.state.pseudo.player2 = "AI";
				if (tournament.idPlayers[2] === 1)
					tournament.state.pseudo.player3 = "AI";
				if (tournament.idPlayers[3] === 1)
					tournament.state.pseudo.player4 = "AI";
				io.to(`tournament-${tournamentId}`).emit("state", updateStateTournament(tournament.state));
				
			});

			socket.on("setupSemiFinal", () => {
				let ennemyId;
				let i = 0;
				for (; i < 4; i++)
				{
					if (playerId == tournament.idPlayers[i])
					{
						if (i % 2 == 0)
							ennemyId = tournament.idPlayers[i + 1];
						else
							ennemyId = tournament.idPlayers[i - 1];
						break;
					}
				}
				let gameId;
				if (i < 2)
					gameId = 0;
				else
					gameId = 1;
				if (tournament.final_arr[0] == 0 && tournament.final_arr[1] == 0)
				{
					console.log("EnnemyId: ", ennemyId);
					if (ennemyId == 1 || i % 2 == 0)
					{
						io.to(socket.id).emit("startTournamentGame", ennemyId, gameId);
					}
					else
						io.to(socket.id).emit("joinTournamentGame", ennemyId, gameId);
				}
			});

			socket.on("setupFinal", () => {
				let ennemyId;
				let gameId = 2;
				if (playerId == tournament.final_arr[0])
				{
					if (tournament.final_arr[1] == 0)
					{
						if (!tournament.disconnectTimer) {
							tournament.disconnectTimer = setTimeout(() => {
								if (tournament.final_arr[1] != 0)
								{
									return;
								}
							}, 5 * 60 * 1000);
						}
					}
					ennemyId = tournament.final_arr[1];
					if (ennemyId == -1)
						ennemyId = 1;
					console.log("ennemyId create : ", ennemyId);
					io.to(socket.id).emit("startTournamentGame", ennemyId, gameId);
				}
				else if (playerId == tournament.final_arr[1])
				{
					if (tournament.final_arr[0] == 0)
					{
						if (!tournament.disconnectTimer) {
							tournament.disconnectTimer = setTimeout(() => {
								if (tournament.final_arr[0] != 0)
								{
									return;
								}
							}, 5 * 60 * 1000);
						}
					}
					ennemyId = tournament.final_arr[0];
					if (ennemyId == -1)
						ennemyId = 1;
					console.log("ennemyId join : ", ennemyId);
					io.to(socket.id).emit("joinTournamentGame", ennemyId, gameId);
				}
			});
		});
}

function updateBrackets(tournament: serverTournament)
{
	const id = tournament.id;
	let gameId = id * 1000;
	if (tournament.state.status == "semifinal")
	{
		const game1 = tournament.games.get(gameId);
		if (!game1)
		{
			console.log("Problem getting game1");
			return;
		}
		tournament.state.finalists.player1 = game1.winner;
		tournament.final_arr[0] = game1.idwinner;

		const game2 = tournament.games.get(gameId + 1);
		if (!game2)
		{
			console.log("Problem getting game2");
			return;
		}
		tournament.state.finalists.player2 = game2.winner;
		tournament.final_arr[1] = game2.idwinner;

		if (tournament.final_arr[0] != 0 && tournament.final_arr[1] != 0)
			tournament.state.status = "final";
	}
	if (tournament.state.status == "final")
	{
		const game3 = tournament.games.get(gameId + 2);
		if (!game3)
		{
			console.log("Problem getting game3");
			return;
		}

		tournament.state.champion.player = game3.winner;
		tournament.state.status = "finished";
	}
}

function updateStateTournament(state: TournamentState)
{
	return {
		status: state.status,
		pseudo: { player1: state.pseudo.player1, player2: state.pseudo.player2, player3: state.pseudo.player3, player4: state.pseudo.player4 },
		finalists: { player1: state.finalists.player1, player2: state.finalists.player2 },
		champion: { player: state.champion.player }
	};
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
			game.winner = game.state.pseudo.player1;
			game.idwinner = game.idPlayer1;
			endGame(game.idPlayer1, game.idPlayer2, game.state.score.player1, game.state.score.player2, game.duration , game.id, gameInfo, game.type);
		}
		else
		{
			game.winner = game.state.pseudo.player2;
			game.idwinner = game.idPlayer2;
			endGame(game.idPlayer2, game.idPlayer1, game.state.score.player2, game.state.score.player1, game.duration , game.id, gameInfo, game.type);
		}
		io.to(`game-${game.id}`).emit("gameOver");
		io.in(`game-${game.id}`).socketsLeave(`game-${game.id}`);
	}
}

export function updateStateGame(state: GameState, status: "waiting" | "playing" | "finished" | "countdown" | "disconnected") {
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
		game.idPlayer2 = 0;
		game.state.pseudo.player1 = pseudo;
		game.state.pseudo.player2 = "Guest";
		if (game.status !== "disconnected")
		{
			game.state.ball.speedX = Math.random() < 0.5 ? -2.5 : 2.5;
			resetBall(game.state);
		}

		game.status = "countdown";
		socket.emit("assignRole", "player1");

		io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status));
		
		//countdown starting
		io.to(`game-${gameId}`).emit("startCountdown", updateStateGame(game.state, game.status));
		//predraw canvas without score to avoid empty screen before countdown
		socket.emit("predraw", updateStateGame(game.state, game.status));
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
		io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status));
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
		io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status));
		io.to(`game-${gameId}`).emit("startCountdown", updateStateGame(game.state, game.status));
	}

	//predraw canvas without score to avoid empty screen before countdown
	socket.emit("predraw", updateStateGame(game.state, game.status));
}

function getPlayer(game: ServerGame, socket: Socket) {
	if (game.sockets.player1 === socket.id)
		return "player1";

	if (game.sockets.player2 === socket.id)
		return "player2";

	return null;
}

function fillSocketTournament(playerId: Number, tournament: serverTournament, socket: Socket, pseudo: string)
{
	if (playerId === tournament.idPlayers[0])
	{
		tournament.sockets.player1 = socket.id;
		tournament.state.pseudo.player1 = pseudo;
	}
	else if (playerId === tournament.idPlayers[1])
	{
		tournament.sockets.player2 = socket.id;
		tournament.state.pseudo.player2 = pseudo;
	}
	else if (playerId === tournament.idPlayers[2])
	{
		tournament.sockets.player3 = socket.id;
		tournament.state.pseudo.player3 = pseudo;
	}
	else if (playerId === tournament.idPlayers[3])
	{
		tournament.sockets.player4 = socket.id;
		tournament.state.pseudo.player4 = pseudo;
	}
	else
	{
		return;
	}
}

function removeSocketTournament(tournament: serverTournament, socket: Socket)
{
	if (tournament.sockets.player1 === socket.id)
	{
		tournament.sockets.player1 = null;
		tournament.state.pseudo.player1 = "Waiting for reconnection...";
	}

	if (tournament.sockets.player2 === socket.id)
	{
		tournament.sockets.player2 = null;
		tournament.state.pseudo.player2 = "Waiting for reconnection...";
	}

	if (tournament.sockets.player3 === socket.id)
	{
		tournament.sockets.player3 = null;
		tournament.state.pseudo.player3 = "Waiting for reconnection...";
	}

	if (tournament.sockets.player4 === socket.id)
	{
		tournament.sockets.player4 = null;
		tournament.state.pseudo.player4 = "Waiting for reconnection...";
	}
}
