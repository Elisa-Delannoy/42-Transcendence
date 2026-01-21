import { Server, Socket } from "socket.io";
import { applyInput, GameState, resetBall } from "./gameEngine";
import { ServerGame, games_map, endGame } from "../routes/game/serverGame";
import { gameInfo, users } from "../server";
import { tournaments_map } from "../routes/tournament/serverTournament";

export function handleGameSocket(io: Server, socket: Socket) {
	socket.on("joinGame", async (gameId: number, tournamentId: number) => {
		let tournament = tournaments_map.get(tournamentId);
		let game;
		if (tournament)
			game = tournament.games.get(gameId);
		else
			game = games_map.get(gameId);
		if (!game)
		{
			io.to(socket.id).emit("kick");
			return;
		}

		socket.data.tournamentId = tournamentId;
		socket.data.gameId = gameId;
		game.setIo(io);
	
		const playerId = socket.data.user.id;
		const pseudo = socket.data.user.pseudo;
		if (socket.data.user.id != game.idPlayer1 && socket.data.user.id != game.idPlayer2)
		{
			if (socket.data.user.id != game.spectators[0] && socket.data.user.id != game.spectators[1])
			{
				socket.data.kick = true;
				io.to(socket.id).emit("kick");
				return;
			}
		}
		checkDeconnections(io, socket, playerId, game);

		if (game.disconnectTimer) {
			clearTimeout(game.disconnectTimer);
			game.disconnectTimer = null;
		}

		// join room
		socket.join(`game-${gameId}`);
	
		if (game.isLocal === true)
			initLocal(game, io, socket, gameId, pseudo);
		else
			initRemoteAndAi(game, io, socket, gameId, playerId, pseudo);
	});

	//after countdown, match is starting
	socket.on("startGame", () => {
		const tournamentId = socket.data.tournamentId;
		const gameId = socket.data.gameId;
		let tournament = tournaments_map.get(tournamentId);
		let game;
		if (tournament)
			game = tournament.games.get(gameId);
		else
			game = games_map.get(gameId);
		if (!game)
			return;
		game.status = "playing";
		socket.emit("state", updateStateGame(game.state, game.status, game.type));
	});

	// Input
	socket.on("input", ({ direction, player }: { direction: "up" | "down" | "stop", player?: "player1" | "player2" }) => {
		const tournamentId = socket.data.tournamentId;
		const gameId = socket.data.gameId;
		let tournament = tournaments_map.get(tournamentId);
		let game;
		if (tournament)
			game = tournament.games.get(gameId);
		else
			game = games_map.get(gameId);
		if (!game)
			return;

		const actualPlayer = game.isLocal ? player : getPlayer(game, socket);
		if (!actualPlayer)
			return;

		applyInput(game?.state, actualPlayer, direction);
	});

	// Disconnect
	socket.on("disconnect", () => {
		const tournamentId = socket.data.tournamentId;
		const gameId = socket.data.gameId;
		let tournament = tournaments_map.get(tournamentId);
		let game;
		if (tournament)
			game = tournament.games.get(gameId);
		else
			game = games_map.get(gameId);
		if (!game)
			return;

		if (socket.data.kick)
			return;
		console.log("Client disconnected:", socket.id);

		if (game.status === "finished")
		{
			io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status, game.type));
			let countdown = 3;
			let interval = setInterval(() => {
				countdown--;
				if (countdown < 0) {
					clearInterval(interval);
					console.log("Game deleted :", gameId);
					games_map.delete(gameId);
				}
			}, 1000);
		}
		else if (game.status === "waiting")
		{
			console.log("Game deleted :", gameId);
			games_map.delete(gameId);
			io.in(`game-${gameId}`).socketsLeave(`game-${gameId}`);
		}
		else
		{
			if (game.type === "Local" || game.type === "AI")
			{
				game.status = "disconnected";
				io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status, game.type));
				if (!game.disconnectTimer) {
					game.disconnectTimer = setTimeout(() => {
						console.log("Timeout disconnected game : ", gameId);
						game.status = "disconnected";
						io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status, game.type));
						games_map.delete(gameId);
						io.in(`game-${gameId}`).socketsLeave(`game-${gameId}`);
					}, 1 * 3 * 1000);
				}
			}
			else
			{
				game.status = "disconnected";
				setDeconnections(socket.data.user.id, game);
				checkDeconnections(io, socket, socket.data.user.id, game);
				io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status, game.type));
				io.in(`game-${gameId}`).socketsLeave(`game-${gameId}`);
			}
		}
	});
}

function checkUser(io: Server, socket: Socket, game: ServerGame) : number
{
	if (socket.data.user.id == game.idPlayer1 && socket.id != game.sockets.player1)
	{
		io.to(socket.id).emit("kick");
		return -1;
	}
	else if (socket.data.user.id == game.idPlayer2 && socket.id != game.sockets.player2)
	{
		io.to(socket.id).emit("kick");
		return -1;
	}
	else if (socket.data.user.id != game.idPlayer1 && socket.data.user.id != game.idPlayer2)
	{
		if (socket.data.user.id != game.spectators[0] && socket.data.user.id != game.spectators[1])
		{
			io.to(socket.id).emit("kick");
		}
	}
	return 0;
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
			game.winner = game.state.users.user1.pseudo;
			game.idwinner = game.idPlayer1;
			game.idloser = game.idPlayer2;
			endGame(game.idPlayer1, game.idPlayer2, game.state.score.player1, game.state.score.player2, game.duration , game.id, gameInfo, game.type, game.gameDate);
		}
		else
		{
			game.winner = game.state.users.user2.pseudo;
			game.idwinner = game.idPlayer2;
			game.idloser = game.idPlayer1;
			endGame(game.idPlayer2, game.idPlayer1, game.state.score.player2, game.state.score.player1, game.duration , game.id, gameInfo, game.type, game.gameDate);
		}
		io.to(`game-${game.id}`).emit("gameOver");
		io.in(`game-${game.id}`).socketsLeave(`game-${game.id}`);
	}
}

export function updateStateGame(state: GameState, status: "waiting" | "playing" | "finished" | "countdown" | "disconnected", type: "Local" | "AI" | "Online" | "Tournament") {
	return {
		ball: { x: state.ball.x, y: state.ball.y },
		paddles: state.paddles,
		score: state.score,
		status: status,
		users: { user1: state.users.user1, user2: state.users.user2 },
		type: type
	};
}

async function initLocal(game: ServerGame, io: Server, socket: Socket, gameId: number, pseudo: string) {
	
	game.sockets.player1 = socket.id;
	game.sockets.player2 = socket.id;
	if (checkUser(io, socket, game) == -1)
		return;
	game.idPlayer2 = 0;
	game.state.users.user1 = await users.getPlayerGame(pseudo);
	console.log(game.state.users.user1);
	game.state.users.user2 = { pseudo: "Guest", elo: 0, avatar: "/files/0.png", lvl:1};
	if (game.status !== "disconnected")
	{
		game.state.ball.speedX = Math.random() < 0.5 ? -2.5 : 2.5;
		resetBall(game.state);
	}

	game.status = "countdown";
	socket.emit("assignRole", "player1");

	io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status, game.type));
	
	//countdown starting
	io.to(`game-${gameId}`).emit("startCountdown", updateStateGame(game.state, game.status, game.type));
	//predraw canvas without score to avoid empty screen before countdown
	socket.emit("predraw", updateStateGame(game.state, game.status, game.type));
}

async function initRemoteAndAi(game: ServerGame, io: Server, socket: Socket, gameId: number, playerId: number, pseudo: string) {
	
	let role: "player1" | "player2" | "spectator";

	if (playerId === game.idPlayer1)
	{
		game.sockets.player1 = socket.id;
		if (checkUser(io, socket, game) == -1)
			return;
		role = "player1";
		game.state.users.user1 = await users.getPlayerGame(pseudo);
	}
	else if (playerId === game.idPlayer2)
	{
		game.sockets.player2 = socket.id;
		if (checkUser(io, socket, game) == -1)
			return;
		role = "player2";
		game.state.users.user2 = await users.getPlayerGame(pseudo);
		io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status, game.type));
	}
	else
	{
		role = "spectator";
		return;
	}
	console.log("role : ", role);
	socket.emit("assignRole", role);

	if (game.status !== "disconnected")
	{
		game.state.ball.speedX = Math.random() < 0.5 ? -2.5 : 2.5;
		resetBall(game.state);
	}

	if (game.idPlayer2 == -1)
		game.state.users.user2 = await users.getPlayerGame("AI");

	// start countdown when 2 players are in the game
	if ((game.sockets.player1 && game.idPlayer2 == -1) 
		|| (game.sockets.player1 && game.sockets.player2 && (game.status === "waiting" || game.status === "disconnected"))) {
		game.status = "countdown";
		io.to(`game-${gameId}`).emit("state", updateStateGame(game.state, game.status, game.type));
		io.to(`game-${gameId}`).emit("startCountdown", updateStateGame(game.state, game.status, game.type));
	}

	//predraw canvas without score to avoid empty screen before countdown
	socket.emit("predraw", updateStateGame(game.state, game.status, game.type));
}

function getPlayer(game: ServerGame, socket: Socket) {
	if (game.sockets.player1 === socket.id)
		return "player1";

	if (game.sockets.player2 === socket.id)
		return "player2";

	return null;
}

function setDeconnections(playerId: number, game: ServerGame)
{
	if (game.type === "Online")
	{
		if (playerId == game.idPlayer1)
			game.nbDeconnectionsP1+=2;
		else if (playerId == game.idPlayer2)
			game.nbDeconnectionsP2+=2;
	}
	if (game.type === "Tournament")
	{
		if (playerId == game.idPlayer1)
			game.nbDeconnectionsP1+=2;
		else if (playerId == game.idPlayer2)
			game.nbDeconnectionsP2+=2;
	}
}

function checkDeconnections(io: Server, socket: Socket, playerId: number, game: ServerGame)
{
	if (playerId == game.idPlayer1)
	{
		if (game.nbDeconnectionsP1 >= 2)
		{
			game.status = "finished";
			const duration = (Date.now() - game.duration) / 1000;
			game.duration = Math.round(duration * 10) / 10;
			game.winner = game.state.users.user2.pseudo;
			game.idwinner = game.idPlayer2;
			game.idloser = game.idPlayer1;
			endGame(game.idPlayer2, game.idPlayer1, 11, 0, game.duration , game.id, gameInfo, game.type, game.gameDate);
			io.to(socket.id).emit("kick");
			io.to(`game-${game.id}`).emit("gameOver");
			io.in(`game-${game.id}`).socketsLeave(`game-${game.id}`);
		}
		else if (game.nbDeconnectionsP1 == 1)
			io.to(socket.id).emit("warning");
	}
	else if (playerId == game.idPlayer2)
	{
		if (game.nbDeconnectionsP2 >= 2)
		{
			game.status = "finished";
			const duration = (Date.now() - game.duration) / 1000;
			game.duration = Math.round(duration * 10) / 10;
			game.winner = game.state.users.user1.pseudo;
			game.idwinner = game.idPlayer1;
			game.idloser = game.idPlayer2;
			endGame(game.idPlayer1, game.idPlayer2, 11, 0, game.duration , game.id, gameInfo, game.type, game.gameDate);
			io.to(socket.id).emit("kick");
			io.to(`game-${game.id}`).emit("gameOver");
			io.in(`game-${game.id}`).socketsLeave(`game-${game.id}`);
		}
		else if (game.nbDeconnectionsP2 == 1)
			io.to(socket.id).emit("warning");
	}
}
