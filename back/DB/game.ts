export const games = new Map<number, Game>();

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

export function updateGame(id: number, data: any) {
	games.get(id)?.update(data);
}

export function getDate(id: number)
{
	return games.get(id)?.gameDate;
}
