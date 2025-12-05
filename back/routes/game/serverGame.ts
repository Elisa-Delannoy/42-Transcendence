export const games_map = new Map<number, ServerGame>();
import { GameInfo } from "../../DB/gameinfo";
import { users } from '../../server';
import { Socket } from "socket.io";
import { GameState } from "../../pong/gameEngine";

export class ServerGame {
	id: number;
	idPlayer1: number | null;
	idPlayer2: number | null;
	status: "waiting" | "playing" | "finished";
	gameDate: string;
	sockets: { player1: string | null, player2: string | null };

	state: GameState;

	constructor(id: number, width = 600, height = 480)
	{
		this.id = id;
		this.idPlayer1 = null;
		this.idPlayer2 = null;
		this.status = "waiting";
		this.gameDate = new Date().toISOString().replace("T", " ").split(".")[0];
		this.sockets = { player1: null, player2: null };
		
		this.state = {
			ball: { x: width / 2, y: height / 2, speedX: 2, speedY: 2 },
			paddles: { player1: height / 2 - 30, player2: height / 2 - 30 },
			score: { player1: 0, player2: 0 },
			width,
			height
		};
	}
}

function getDate(id: number)
{
	return games_map.get(id)?.gameDate;
}

function getIdPlayer1(id: number)
{
	return games_map.get(id)?.idPlayer1;
}

function getIdPlayer2(id: number)
{
	return games_map.get(id)?.idPlayer2;
}

export function getPlayersId(id: number)
{
	const ids: any = [];
	ids.push(getIdPlayer1(id));
	ids.push(getIdPlayer2(id));
	return ids;
}

export function createGame()
{
	let id: number = 1;
	while (games_map.has(id))
		id++;
	const gameId = id;
	const game = new ServerGame(gameId);
	games_map.set(gameId, game);
	console.log(["games_map", ...games_map]);
	return gameId;
}


// export function updateGameStatus(gameId: number, status: string)
// {
// 	const game = games_map.get(gameId);
// 	if (game)
// 		game.status = status;
// }

export async function displayGameList()
{
	const list: any = [];

	for (const game of games_map.values()) {
		list.push({
			id: game.id,
			state: game.status,
			createdAt: game.gameDate
		});
	}
	console.log("list :", list);
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
	// const game = games_map.get(gameid);
	// // if (game)
	// // 	updateGameStatus(gameid, "finished");
	await gameInfo.finishGame(winner, loser, winner_score, loser_score, duration_game, gameDate);
	games_map.delete(gameid);
}
