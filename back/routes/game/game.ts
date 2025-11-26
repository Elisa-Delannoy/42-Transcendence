export const games = new Map<number, Game>();
import { GameInfo } from "./../../DB/gameinfo";

export class Game {

	id: number;
	idPlayer1: number;
	idPlayer2: number;
	ballPos: { x: number, y: number};
	paddlePos: { player1: number, player2: number};
	status: string;
	gameDate: string;

	constructor(id: number, playerId1: number, playerId2: number)
	{
		this.id = id;
		this.idPlayer1 = playerId1;
		this.idPlayer2 = playerId2;
		this.ballPos = { x: 0, y: 0};
		this.paddlePos = { player1: 0, player2: 0};
		this.status = "waiting";
		this.gameDate = new Date().toISOString().replace("T", " ").split(".")[0];
	}

	update(data: any) {
		this.ballPos = data.ballPos;
		this.paddlePos = data.paddlePos;
	}
}

// enum GameStatus
// {
// 	ongoing,
// 	finished,
// 	error,
// 	waiting
// }

function getDate(id: number)
{
	return games.get(id)?.gameDate;
}

function getIdPlayer1(id: number)
{
	return games.get(id)?.idPlayer1;
}

function getIdPlayer2(id: number)
{
	return games.get(id)?.idPlayer2;
}

export function createGame(playerId: number)
{
	let id: number = 1;
	while (games.has(id))
		id++;
	const gameId = id;
	const game = new Game(gameId, playerId, NaN);
	games.set(gameId, game);
	console.log([...games]);
	return gameId;
}

export function updateGamePos(gameId: number, ballPos: { x: number, y: number }, paddlePos: { player1: number, player2: number })
{
	games.get(gameId)?.update({ ballPos, paddlePos });
}

export function updateGameStatus(gameId: number, status: string)
{
	const game = games.get(gameId);
	if (game)
		game.status = status;
}

export function displayGameList()
{
	const list: any = [];

	for (const game of games.values()) {
		list.push({
			id: game.id,
			player1: game.idPlayer1,
			player2: game.idPlayer2,
			state: game.status,
			createdAt: game.gameDate
		});
	}

	return list;
}

export function joinGame(playerId: number, gameId: number)
{
	const game = games.get(gameId);
	if (game)
		game.idPlayer1 = playerId;
}

export async function endGame(winner_id: number, loser_id: number, winner_score: number,
	loser_score: number, duration_game: number, id: number, gameInfo: GameInfo): Promise<void>
{
	const gameid = Number(id);
	const gameDate: any = getDate(gameid);
	let winner: any;
	let loser: any;
	if (winner_id == 1)
	{
		winner = getIdPlayer1(gameid);
		loser = getIdPlayer2(gameid);
	}
	else
	{
		loser = getIdPlayer1(gameid);
		winner = getIdPlayer2(gameid);
	}
	const game = games.get(gameid);
	if (game)
		updateGameStatus(gameid, "finished");
	await gameInfo.finishGame(winner, loser, winner_score, loser_score, duration_game, gameDate);
	games.delete(gameid);
}
