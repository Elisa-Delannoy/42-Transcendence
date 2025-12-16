export const games_map = new Map<number, ServerGame>();
import { GameInfo } from "../../DB/gameinfo";
import { GameState, updateBall, updatePaddles } from "../../pong/gameEngine";
import { simulateAI } from "../../pong/simulateAI";
import { checkForWinner, serializeForClient } from "../../pong/pongServer";
import { Server } from "socket.io";

const TICK_RATE = 16;

export class ServerGame {
	id: number;
	idPlayer1: number;
	idPlayer2: number;
	status: "waiting" | "playing" | "finished" | "countdown";
	type: "Local" | "IA" | "Online" | "Tournament";
	gameDate: string;
	duration: number;
	isLocal: boolean;
	lastTick: number;
	sockets: { player1: string | null, player2: string | null };
	intervalId: NodeJS.Timeout;

	state: GameState & { aiLastUpdate?: number };

	private io?: Server;

	constructor(id: number, isLocal: boolean, io?: Server, width = 600, height = 480)
	{
		this.id = id;
		this.idPlayer1 = 0;
		this.idPlayer2 = 0;
		this.status = "waiting";
		this.type = "Local";
		this.gameDate = new Date().toISOString().replace("T", " ").split(".")[0];
		this.duration = Date.now();
		this.isLocal = isLocal;
		this.lastTick = Date.now();
		this.io = io;
		this.sockets = { player1: null, player2: null };
		this.intervalId = setInterval(() => {
			this.gameLoop();
		}, TICK_RATE);

		this.state = {
			ball: { x: width / 2, y: height / 2, speedX: 2.5, speedY: 2 },
			paddles: { player1: height / 2 - 30, player2: height / 2 - 30 },
			score: { player1: 0, player2: 0, max: 4 },
			width,
			height,
			aiLastUpdate: 0,
			inputs: {
				player1: "stop",
				player2: "stop"
			},
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
			this.io.to(`game-${this.id}`).emit("state", serializeForClient(this.state, this.status));

			checkForWinner(this, this.io);
		}
	}

	setIo(io: Server) {
		this.io = io;
	}
}

function getDate(id: number)
{
	return games_map.get(id)?.gameDate;
}

export function createGame(PlayerId: number,  isLocal: boolean, options: { vsAI: boolean }): number 
{
	let id: number = 1;
	while (games_map.has(id))
		id++;
	const gameId = id;
	const game = new ServerGame(gameId, isLocal);
	game.idPlayer1 = PlayerId;
	if (options.vsAI)
	{
		game.idPlayer2 = -1;
		game.type = "IA";
	}
	games_map.set(gameId, game);
	return gameId;
}

export async function displayGameList()
{
	const list: any = [];

	for (const game of games_map.values()) {
		if (game.status == "waiting")
		{
			list.push({
				id: game.id,
				state: game.status,
				createdAt: game.gameDate
			});
		}
	}
	return list;
}

export function joinGame(playerId: number, gameId: number)
{
	const game = games_map.get(gameId);
	if (game)
		{
			if (!(game.idPlayer2))
			game.idPlayer2 = playerId;
		else
			console.log("Game is already full.");
	}
	console.log(game);
}

export async function endGame(winner_id: number, loser_id: number, winner_score: number,
	loser_score: number, duration_game: number, gameid: number, gameInfo: GameInfo, type: string): Promise<void>
{
	const gameDate: any = getDate(Number(gameid));
	await gameInfo.finishGame(winner_id, loser_id, winner_score, loser_score, duration_game, gameDate, type);
	games_map.delete(gameid);
}
