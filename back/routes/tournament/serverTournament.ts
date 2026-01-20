export const tournaments_map = new Map<number, serverTournament>();
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
	idFirst: number;
	idSecond: number;
	idThird: number;
	idFourth: number;
	disconnectTimer: NodeJS.Timeout | null;
	state: TournamentState;
	finalized: boolean = false;

	constructor(id: number)
	{
		this.id = id;
		this.idPlayers = Array(4).fill(-1);
		this.sockets = { player1: null, player2: null, player3: null, player4: null };
		this.semi_index = [0, 2, 1, 3];
		this.final_arr = [0, 0];
		this.idFirst = 0;
		this.idSecond = 0;
		this.idThird = 0;
		this.idFourth = 0;
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
}

export function createTournament(playerId: number)
{
	let count: number = 0;
	for (const tournament of tournaments_map.values()) {
		if (tournament.idPlayers.includes(playerId))
			count++;
	}
	if (count > 1)
		return -1;
	else if (count == 1)
		return -2;

	let id: number = 1;
	while (tournaments_map.has(id))
		id++;
	if (id > 1)
	{
		id--;
		const tournament = tournaments_map.get(id);
		for (let i = 0; i < 4; i++)
		{
			if (tournament?.state.status != "waiting")
				break;
			if (tournament?.idPlayers[tournament.semi_index[i]] == -1)
			{
				tournament.idPlayers[tournament.semi_index[i]] = playerId;
				return id;
			}
		}
		id++;
		const tournament_bis = new serverTournament(id);
		tournament_bis.idPlayers[0]= playerId; 
		tournaments_map.set(id, tournament_bis);
		return id;
	}
	else
	{
		const tournament = new serverTournament(id);
		tournament.idPlayers[0]= playerId;
		tournaments_map.set(id, tournament);
		return id;
	}

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

export function joinTournamentGame(playerId: number, gameId: number, tournamentID: number, isWatching: boolean) : number
{
	const tournament = tournaments_map.get(tournamentID);
	if (tournament)
	{
		let id: number = tournamentID * 1000;
		id += gameId;
		const game = tournament.games.get(id);
		if (game)
		{
			if (game.idPlayer2 == 0)
				game.idPlayer2 = playerId;
			else if (isWatching)
			{
				if (game.spectators[0] == 0)
					game.spectators[0] = playerId;
				else if (game.spectators[1] == 0)
					game.spectators[1] = playerId;
			}
		}
		return id;
	}
	return -1;
}
