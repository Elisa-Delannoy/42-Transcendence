export const tournaments_map = new Map<number, TournamentInstance>();
import { Server } from "socket.io";
import { ServerGame } from "../game/serverGame";


export class TournamentInstance {
	id: number;
	games = new Map<number, ServerGame>();
	idPlayers: number[];
	sockets: { player1: string | null, player2: string | null, player3: string | null, player4: string | null };
	pseudoPlayers: string[];
	arr_index: number[];
	index: number;
	private io?: Server;
	disconnectTimer: NodeJS.Timeout | null;

	constructor(id: number, io?: Server)
	{
		this.id = id;
		this.idPlayers = Array(4).fill(1);
		this.sockets = { player1: null, player2: null, player3: null, player4: null };
		this.pseudoPlayers = Array(4);
		this.io = io;
		this.arr_index = [0, 2, 1, 3];
		this.index = 0;
		this.disconnectTimer = null;
	}

	setIo(io: Server) {
		this.io = io;
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
		if (tournament.idPlayers.includes(playerId))
			return;

		let i = tournament.index;
		for (i; i < 4; i++)
		{
			if (tournament.idPlayers[tournament.arr_index[i]] == 1)
			{
				tournament.idPlayers[tournament.arr_index[i]] = playerId;
				return;
			}
		}
		console.log("This tournament is full.");
	}
}

export function getIdPlayers(tournamentId: number) {
	const tournament = tournaments_map.get(tournamentId);
	return tournament?.idPlayers;
}
