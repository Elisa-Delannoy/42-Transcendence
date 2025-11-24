export const games = new Map<number, Game>();
import { GameInfo } from "./../../DB/gameinfo";

let nextGameId: number = 1;

export class Game {

	id: number;
	players: number[];
	ballPos: { x: number, y: number};
	paddlePos: { player1: number, player2: number};
	isFinished: boolean;
	gameDate: string;

	constructor(id: number)
	{
		this.id = id;
		this.players = [];
		this.ballPos = { x: 0, y: 0};
		this.paddlePos = { player1: 0, player2: 0};
		this.isFinished = false;
		this.gameDate = new Date().toISOString().replace("T", " ").split(".")[0];
	}

	update(data: any) {
		this.ballPos = data.ballPos;
		this.paddlePos = data.paddlePos;
	}
}

export function getDate(id: number)
{
	return games.get(id)?.gameDate;
}

export function createGame()
{
	const gameId = nextGameId;
	nextGameId++;
	console.log("gameId : ", gameId, " type = ", typeof gameId);

	const game = new Game(gameId);
	games.set(gameId, game);
	return gameId;
}

export function updateGame(gameId: number, ballPos: { x: number, y: number }, paddlePos: { player1: number, player2: number })
{
	games.get(gameId)?.update({ ballPos, paddlePos });
}

export async function endGame(winner_id: number, loser_id: number, winner_score: number,
	loser_score: number, duration_game: number, id: number, gameInfo: GameInfo): Promise<void>
{
	const gameid = Number(id);
	const gameDate: any = getDate(gameid);
	await gameInfo.finishGame(winner_id, loser_id, winner_score, loser_score, duration_game, gameDate);
}
