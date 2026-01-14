import { Server, Socket } from "socket.io";
import { createTournamentGame, joinTournamentGame, serverTournament, tournaments_map } from "../routes/tournament/serverTournament";
import { TournamentState } from "../../front/src/tournament/tournamentNetwork";

export function handleTournamentSocket(io: Server, socket: Socket)
{
	socket.on("joinTournament", (tournamentId: number) => {
		let tournament = tournaments_map.get(tournamentId);
		const playerId = socket.data.user.id;
	
		if (!tournament || playerId === undefined)
			return;
	
		// join room
		socket.join(`tournament-${tournamentId}`);
	
		socket.data.tournamentId = tournamentId;
		//reset timer
		if (tournament.disconnectTimer) {
			clearTimeout(tournament.disconnectTimer);
			tournament.disconnectTimer = null;
		}
	
		fillSocketTournament(playerId, tournament, socket);
		updateBrackets(io, tournament, socket.data.tournamentId);
		io.to(`tournament-${tournamentId}`).emit("state", updateStateTournament(tournament.state));
	
		//emit to display start button for tournament creator
		if (playerId == tournament.idPlayers[0] && tournament.state.status === "waiting")
			io.to(socket.id).emit("hostTournament", tournamentId);
	});

	socket.on("disconnect", () => {
		const tournamentId = socket.data.tournamentId;
		let tournament = tournaments_map.get(tournamentId);
		if (!tournament)
			return;

		if (tournament.state.status === "finished")
		{
			io.to(`tournament-${tournamentId}`).emit("state", updateStateTournament(tournament.state));
			console.log("Client disconnected:", socket.id);
			let countdown = 30;
			let interval = setInterval(() => {
				countdown--;
				if (countdown < 0) {
					clearInterval(interval);
					console.log("Tournament deleted :", tournamentId);
					tournaments_map.delete(tournamentId);
				}
			}, 1000);
		}
	});

	socket.on("startTournament", () => {
		const tournamentId = socket.data.tournamentId;
		let tournament = tournaments_map.get(tournamentId);
		if (!tournament)
			return;
		tournament.state.status = "semifinal";
		if (tournament.idPlayers[0] === -1)
			tournament.state.pseudo.player1 = "AI";
		if (tournament.idPlayers[1] === -1)
			tournament.state.pseudo.player2 = "AI";
		if (tournament.idPlayers[2] === -1)
			tournament.state.pseudo.player3 = "AI";
		if (tournament.idPlayers[3] === -1)
			tournament.state.pseudo.player4 = "AI";
		io.to(`tournament-${tournamentId}`).emit("state", updateStateTournament(tournament.state));
		
	});

	socket.on("setupSemiFinal", () => {
		const tournamentId = socket.data.tournamentId;
		const playerId = socket.data.user.id;
		let tournament = tournaments_map.get(tournamentId);
		if (!tournament)
			return;
		let ennemyId: number;
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
		let gameId: number;
		if (i < 2)
			gameId = 0;
		else
			gameId = 1;

		let countdown = 3;
		let interval = setInterval(() => {
			countdown--;
			if (countdown <= 0) {
				clearInterval(interval);
				if (tournament.final_arr[0] == 0 && tournament.final_arr[1] == 0)
				{
					if (ennemyId == -1 || i % 2 == 0)
					{
						gameId = setupGameTournament(socket, ennemyId, tournament.id, gameId);
						io.to(socket.id).emit("startTournamentGame", gameId, tournamentId);
					}
					else
					{
						gameId = joinTournamentGame(socket.data.user.id, gameId, tournamentId);
						io.to(socket.id).emit("joinTournamentGame", gameId, tournamentId);
					}
				}
			}
		}, 1000);

		
	});

	socket.on("setupFinal", () => {
		const tournamentId = socket.data.tournamentId;
		const playerId = socket.data.user.id;
		let tournament = tournaments_map.get(tournamentId);
		if (!tournament)
			return;
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
			let countdown = 3;
			let interval = setInterval(() => {
				countdown--;
				if (countdown < 0) {
					clearInterval(interval);
					ennemyId = tournament.final_arr[1];
					gameId = setupGameTournament(socket, ennemyId, tournament.id, gameId);
					io.to(socket.id).emit("startTournamentGame", gameId, tournamentId);
				}
			}, 1000);
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
			let countdown = 5;
			let interval = setInterval(() => {
				countdown--;
				if (countdown < 0) {
					clearInterval(interval);
					ennemyId = tournament.final_arr[0];
					if (ennemyId == -1)
					{
						gameId = setupGameTournament(socket, ennemyId, tournament.id, gameId);
						io.to(socket.id).emit("startTournamentGame", gameId, tournamentId);
					}
					else
					{
						gameId = joinTournamentGame(socket.data.user.id, gameId, tournamentId);
						io.to(socket.id).emit("joinTournamentGame", gameId, tournamentId);
					}
				}
			}, 1000);
		}
	});
}

function setupGameTournament(socket: Socket, ennemyId: number | undefined, tournamentId: number, gameId: number) : number
{
	let id;
	if (ennemyId == -1)
		id = createTournamentGame(socket.data.user.id, false, "Tournament", true ,tournamentId, gameId);
	else
		id = createTournamentGame(socket.data.user.id, false, "Tournament", false, tournamentId, gameId);
	return id;
}

function updateBrackets(io: Server, tournament: serverTournament, tournamentId: number)
{
	const id = tournament.id;
	let gameId = id * 1000;
	if (tournament.state.status == "semifinal")
	{
		//Only AI in first game
		if (tournament.idPlayers[0] == -1 && tournament.idPlayers[1] == -1)
		{
			tournament.final_arr[0] = -1;
			tournament.state.finalists.player1 = "AI";
			io.to(`tournament-${tournamentId}`).emit("setWinner", 0);
			io.to(`tournament-${tournamentId}`).emit("setLoser", 1);
		}
		else
		{
			const game1 = tournament.games.get(gameId);
			if (!game1)
			{
				console.log("Problem getting game1");
				return;
			}
			tournament.state.finalists.player1 = game1.winner;
			tournament.final_arr[0] = game1.idwinner;
			if (tournament.idPlayers[0] == game1.idwinner)
				io.to(`tournament-${tournamentId}`).emit("setWinner", 0, 1);
			else
				io.to(`tournament-${tournamentId}`).emit("setWinner", 1, 0);
		}

		//Only AI in second game
		if (tournament.idPlayers[2] == -1 && tournament.idPlayers[3] == -1)
		{
			tournament.final_arr[1] = -1;
			tournament.state.finalists.player2 = "AI";
			io.to(`tournament-${tournamentId}`).emit("setWinner", 2, 3);
		}
		else
		{
			const game2 = tournament.games.get(gameId + 1);
			if (!game2)
			{
				console.log("Problem getting game2");
				return;
			}
			tournament.state.finalists.player2 = game2.winner;
			tournament.final_arr[1] = game2.idwinner;
			if (tournament.idPlayers[2] == game2.idwinner)
				io.to(`tournament-${tournamentId}`).emit("setWinner", 2, 3);
			else
				io.to(`tournament-${tournamentId}`).emit("setWinner", 3, 2);
		}

		if (tournament.final_arr[0] != 0 && tournament.final_arr[1] != 0)
			tournament.state.status = "final";
	}
	if (tournament.state.status == "final")
	{
		//Only AI in final
		if (tournament.final_arr[0] == -1 && tournament.final_arr[1] == -1)
		{
			tournament.state.champion.player = "AI";
			tournament.state.status = "finished";
		}
		else
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

function fillSocketTournament(playerId: Number, tournament: serverTournament, socket: Socket)
{
	const pseudo = socket.data.user.pseudo;
	if (playerId === tournament.idPlayers[0])
	{
		tournament.sockets.player1 = socket.data.user.id;
		tournament.state.pseudo.player1 = pseudo;
	}
	else if (playerId === tournament.idPlayers[1])
	{
		tournament.sockets.player2 = socket.data.user.id;
		tournament.state.pseudo.player2 = pseudo;
	}
	else if (playerId === tournament.idPlayers[2])
	{
		tournament.sockets.player3 = socket.data.user.id;
		tournament.state.pseudo.player3 = pseudo;
	}
	else if (playerId === tournament.idPlayers[3])
	{
		tournament.sockets.player4 = socket.data.user.id;
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
