import { navigateTo, genericFetch, loadHeader } from "../router";
import { TournamentNetwork } from "../tournament/tournamentNetwork";

let net: TournamentNetwork | null = null;

export function BracketsView(): string {
	loadHeader();
	return (document.getElementById("bracketshtml") as HTMLTemplateElement).innerHTML;
}

export async function initBrackets(params?: any) {
	const tournamentID: string = params?.id;
	const pseudoP1 = document.getElementById("player1-name");
	const pseudoP2 = document.getElementById("player2-name");
	const pseudoP3 = document.getElementById("player3-name");
	const pseudoP4 = document.getElementById("player4-name");
	const pseudoP5 = document.getElementById("player5-name");
	const pseudoP6 = document.getElementById("player6-name");
	const pseudoP7 = document.getElementById("player7-name");
	const pseudoP8 = document.getElementById("player8-name");
	const pseudos = [
		pseudoP1, pseudoP2, pseudoP3, pseudoP4,
		pseudoP5, pseudoP6, pseudoP7, pseudoP8
	];


	const id = await genericFetch("/api/private/game/playerinfo");

	const serverUrl = window.location.host;

	net = new TournamentNetwork(serverUrl, Number(tournamentID));

	net.join(Number(tournamentID), Number(id));

	net.onState((idPlayers: number[]) => {
		updateBrackets(idPlayers);
	});

	async function updateBrackets(idPlayers: number[]) {
		for (let i = 0; i < 8; i++) {
			const el = pseudos[i];
			const playerId = Number(idPlayers[i]);

			if (!el) continue;

			if (playerId === 1) {
				el.innerText = "En attente...";
			} else {
				el.innerText = `Player ${playerId}`;
			}
		}
	}
}
