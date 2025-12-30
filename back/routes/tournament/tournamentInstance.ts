export const tournaments_map = new Map<number, TournamentInstance>();
import { ServerGame } from "../game/serverGame";

export class TournamentInstance {
	id: number;
	games = new Map<number, ServerGame>();
	idPlayers: number[];

	constructor(id: number)
	{
		this.id = id;
		this.idPlayers = Array(8).fill(1);
	}
}

export function createTournament(playerId: number)
{
	let id: number = 1;
	while (tournaments_map.has(id))
		id++;
	const tournamentId = id;
	const tournament = new TournamentInstance(tournamentId);
	tournament.idPlayers[0]= playerId;
	tournaments_map.set(tournamentId, tournament);
	return tournamentId;
}

export async function displayTournamentList()
{
	const list: any = [];

	for (const tournament of tournaments_map.values()) {
		list.push({
			id: tournament.id
		});
	}
	return list;
}

export function joinTournament(playerId: number, gameId: number)
{
	const tournament = tournaments_map.get(gameId);
	if (tournament)
	{
		for (let i = 2; i < 9; i++)
		{
			if (tournament.idPlayers[i] == 1)
			{
				tournament.idPlayers[i] = playerId;
				return;
			}
		}
		console.log("This tournament is full.");
	}
}
