export const games_map = new Map<number, ServerGame>();
import { GameInfo } from "../../DB/gameinfo";
import { GameState, updateBall, updatePaddles } from "../../pong/gameEngine";
import { simulateAI } from "../../pong/simulateAI";
import { checkForWinner, updateStateGame } from "../../pong/pongServer";
import { Server } from "socket.io";
import { users, users_stats } from "../../server";

const TICK_RATE = 16;

export class ServerGame {
	id: number;
	idPlayer1: number;
	idPlayer2: number;
	nbDeconnectionsP1: number;
	nbDeconnectionsP2: number;
	idwinner: number;
	idloser: number;
	status: "waiting" | "playing" | "finished" | "countdown" | "disconnected";
	type: "Local" | "AI" | "Online" | "Tournament";
	gameDate: string;
	duration: number;
	isLocal: boolean;
	lastTick: number;
	winner: string;
	spectators: number[];
	sockets: { player1: string | null, player2: string | null };
	intervalId: NodeJS.Timeout;
	disconnectTimer: NodeJS.Timeout | null;

	state: GameState & { aiLastUpdate?: number };

	private io?: Server;

	constructor(id: number, isLocal: boolean, io?: Server, width = 900, height = 720)
	{
		this.id = id;
		this.idPlayer1 = 0;
		this.idPlayer2 = 0;
		this.nbDeconnectionsP1 = 0;
		this.nbDeconnectionsP2 = 0;
		this.idwinner = 0;
		this.idloser = 0;
		this.status = "waiting";
		this.type = "Local";
		this.gameDate = new Date().toISOString().replace("T", " ").split(".")[0];
		this.duration = Date.now();
		this.isLocal = isLocal;
		this.lastTick = Date.now();
		this.winner = "";
		this.spectators = Array(2).fill(0);
		this.io = io;
		this.sockets = { player1: null, player2: null };
		this.intervalId = setInterval(() => {
			this.gameLoop();
		}, TICK_RATE);
		this.disconnectTimer = null;

		this.state = {
			ball: { x: width / 2, y: height / 2, speedX: 2.5, speedY: 2 },
			paddles: { player1: height / 2 - 50, player2: height / 2 - 50 },
			score: { player1: 0, player2: 0, max: 3 },
			width,
			height,
			aiLastUpdate: 0,
			aiTargetY: null,
			inputs: {
				player1: "stop",
				player2: "stop"
			},
			users: {
				user1: { pseudo: "Waiting for Player 1", elo: 0, avatar: "/files/0.png", lvl: 1},
				user2: { pseudo: "Waiting for Player 2", elo: 0, avatar: "/files/0.png", lvl: 1},
			}
		};
	}

	gameLoop() {
		const now = Date.now();
		const deltaTime = (now - this.lastTick) / 1000;
		this.lastTick = now;

		if (this.status === "playing" && this.io) {
			updateBall(this.state);
			if (this.idPlayer2 === -1)
				simulateAI(this.state as any, deltaTime);

			updatePaddles(this.state, deltaTime);
			this.io.to(`game-${this.id}`).emit("state", updateStateGame(this.state, this.status, this.type));

			checkForWinner(this, this.io);
		}
	}

	setIo(io: Server) {
		this.io = io;
	}
}

export function createGame(PlayerId: number, isLocal: boolean, type: "Local" | "AI" | "Online" | "Tournament", options: { vsAI: boolean }): number 
{
	let id: number
	if (type === "AI" || type === "Local")
		id = 1000000;
	else
		id = 1;
	while (games_map.has(id))
		id++;
	const gameId = id;
	const game = new ServerGame(gameId, isLocal);
	game.idPlayer1 = PlayerId;
	game.type = type;
	if (options.vsAI)
	{
		game.idPlayer2 = -1;
		if (game.type != "Tournament")
		game.type = "AI";
	}
	games_map.set(gameId, game);
	return gameId;
}

export function isCreator(playerId: number)
{
	let count: number = 0;
	for (const game of games_map.values()) {
		if (game.idPlayer1 === playerId || game.idPlayer2 === playerId)
			count++;
	}
	if (count > 0)
		return -1;
	
	let id: number = 1;
	while (games_map.has(id))
		id++;
	if (id > 1)
		id--;

	const game = games_map.get(id);
	if (game)
	{
		if (game.idPlayer2 == 0)
		{
			if (game.idPlayer1 != playerId)
			{
				game.idPlayer2 = playerId;
				return id;
			}
			else
				return -1;
		}
	}
	return 0;
}

export function joinGame(playerId: number, gameId: number) : number
{
	const game = games_map.get(gameId);
	if (game)
	{
		if (game.idPlayer2 == 0)
		{
			console.log("id player1 : ", game.idPlayer1);
			console.log("id playerId : ", playerId);
			if (game.idPlayer1 != playerId)
				game.idPlayer2 = playerId;
			else
				return -1;
		}
		else
			console.log("Entered the game as a spectator.");
	}
	return 0;
}

export function getGameType(gameId: number)
{
	const game = games_map.get(gameId);
	let res: string | null = null;
	if (game)
		res = game.type;
	return res;
}

export async function endGame(winner_id: number, loser_id: number, winner_score: number,
	loser_score: number, duration_game: number, gameid: number, gameInfo: GameInfo, type: string, gameDate: string): Promise<void>
{
	if (type === "Online" || type === "Tournament")
	{
			const new_elo = await users.getNewElo(winner_id, loser_id, winner_score, loser_score);
			await gameInfo.finishGame(winner_id, loser_id, winner_score, loser_score, duration_game, gameDate, type, new_elo);
			await users.updateElo(winner_id, loser_id, new_elo.winner_elo, new_elo.loser_elo);
			await users.updateXp(winner_id, loser_id, winner_score, loser_score);
			await users_stats.updateStats(winner_id, true, true);
			await users_stats.updateStats(loser_id, true, false);
	}
	else
		await gameInfo.finishGame(winner_id, loser_id, winner_score, loser_score, duration_game, gameDate, type, {winner_elo:0,loser_elo:0});
	games_map.delete(gameid);
}
