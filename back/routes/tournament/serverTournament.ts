export const tournaments_map = new Map<number, serverTournament>();
import { Server } from "socket.io";
import { ServerGame } from "../game/serverGame";

interface TournamentState {
	status: "waiting" | "semifinal" | "final" | "finished";
	pseudo: { player1: string; player2: string; player3: string; player4: string };
	finalists: { player1: string; player2: string };
	champion: { player: string };
}

export class serverTournament {
	id: number;
	games = new Map<number, ServerGame>();
	idPlayers: number[];
	sockets: { player1: string | null, player2: string | null, player3: string | null, player4: string | null };
	semi_index: number[];
	final_arr: number[];
	private io?: Server;
	disconnectTimer: NodeJS.Timeout | null;
	state: TournamentState;

	constructor(id: number, io?: Server)
	{
		this.id = id;
		this.idPlayers = Array(4).fill(-1);
		this.sockets = { player1: null, player2: null, player3: null, player4: null };
		this.io = io;
		this.semi_index = [0, 2, 1, 3];
		this.final_arr = [0, 0];
		this.disconnectTimer = null;
		this.state = {
			status: "waiting",
			pseudo: {
				player1: "Waiting for player...",
				player2: "Waiting for player...",
				player3: "Waiting for player...",
				player4: "Waiting for player...",
			},
			finalists: {
				player1: "Winner 1",
				player2: "Winner 2",
			},
			champion: { player: "Champion" }
		};
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
	const tournament = new serverTournament(tournamentId);
	tournament.idPlayers[0]= playerId;
	tournaments_map.set(tournamentId, tournament);
	return tournamentId;
}

export async function displayTournamentList()
{
	const list: any = [];

	for (const tournament of tournaments_map.values()) {
		if (tournament.state.status == "waiting")
		{
			list.push({
				id: tournament.id
			});
		}
	}
	return list;
}

export function getTournamentGameType(tournamentId: number, gameId: number)
{
	const tournament = tournaments_map.get(tournamentId);
	let res: string | null = null;
	if (tournament)
	{
		const game = tournament.games.get(gameId);
		if (game)
			res = game.type;
	}
	return res;
}

export function joinTournament(playerId: number, tournamentId: number)
{
	const tournament = tournaments_map.get(tournamentId);
	if (tournament)
	{
		if (tournament.idPlayers.includes(playerId))
			return;

		for (let i = 0; i < 4; i++)
		{
			if (tournament.idPlayers[tournament.semi_index[i]] == -1)
			{
				tournament.idPlayers[tournament.semi_index[i]] = playerId;
				return;
			}
		}
		console.log("This tournament is full.");
	}
}

export function createTournamentGame(PlayerId: number, isLocal: boolean, type: "Local" | "AI" | "Online" | "Tournament", vsAI: boolean, tournamentID: number, gameId: number): number 
{
	const tournament = tournaments_map.get(tournamentID);
	if (tournament)
	{
		let id: number = tournamentID * 1000;
		id += gameId;
		const game = new ServerGame(id, isLocal);
		game.idPlayer1 = PlayerId;
		console.log("game.idPlayer1", game.idPlayer1);
		game.type = type;
		if (vsAI)
			game.idPlayer2 = -1;
		console.log("game.idPlayer2", game.idPlayer2);
		tournament.games.set(id, game);
		return id;
	}
	else
		return -2;
}

export function joinTournamentGame(playerId: number, gameId: number, tournamentID: number) : number
{
	const tournament = tournaments_map.get(tournamentID);
	if (tournament)
	{
		let id: number = tournamentID * 1000;
		id += gameId;
		console.log("gameid back join : ", id);
		const game = tournament.games.get(id);
		if (game)
		{
			if (game.idPlayer2 == 0)
				game.idPlayer2 = playerId;
			else
				console.log("Game is already full.");
		}
		return id;
	}
	return -1;
}

export function getIdPlayers(tournamentId: number) {
	const tournament = tournaments_map.get(tournamentId);
	return tournament?.idPlayers;
}
