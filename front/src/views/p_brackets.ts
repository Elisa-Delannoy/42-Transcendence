import { navigateTo, genericFetch, loadHeader } from "../router";
import { TournamentInstance } from "../tournament/tournamentInstance";
import { TournamentNetwork, TournamentState } from "../tournament/tournamentNetwork";

let net: TournamentNetwork | null = null;
let currentTournament: TournamentInstance | null = null;

export function BracketsView(): string {
	loadHeader();
	return (document.getElementById("bracketshtml") as HTMLTemplateElement).innerHTML;
}

export async function initBrackets(params?: any) {
	const tournamentID: string = params?.id;
	const startTournamentButton = document.getElementById("start-button");
	const pseudoP1 = document.getElementById("player1-name");
	const pseudoP2 = document.getElementById("player2-name");
	const pseudoP3 = document.getElementById("player3-name");
	const pseudoP4 = document.getElementById("player4-name");
	const pseudos = [
		pseudoP1, pseudoP2, pseudoP3, pseudoP4
	];

	const id = await genericFetch("/api/private/game/playerinfo");

	const serverUrl = window.location.host;

	currentTournament = new TournamentInstance();

	net = new TournamentNetwork(serverUrl, Number(tournamentID));

	net.join(Number(tournamentID), Number(id.playerId));

	net.onState((state: TournamentState) => {
		if(!currentTournament)
			return;

		currentTournament.applyServerState(state);
		updatePseudo();
	});

	net.onCreator((playerId: number) => {
		if (playerId == id.playerId)
		{
			startTournamentButton?.classList.remove("hidden");
			startTournamentButton?.addEventListener("click", async () => {
				console.log("Starting tournament!");
				net?.startTournament();
			});
		}
	});

	async function updateBrackets(idPlayers: number[], pseudoPlayers: string[]) {
		for (let i = 0; i < 4; i++) {
			const pseudo = pseudos[i];
			const playerId = Number(idPlayers[i]);

			if (!pseudo) continue;

			if (playerId === 1) {
				pseudo.innerText = "Waiting for player...";
			} else {
				pseudo.innerText = pseudoPlayers[i];
			}
		}
	}

	function updatePseudo() {
		if (currentTournament)
		{
			if (pseudoP1)
				pseudoP1.innerText = currentTournament.getCurrentState().pseudo.player1;
			if (pseudoP2)
				pseudoP2.innerText = currentTournament.getCurrentState().pseudo.player2;
			if (pseudoP3)
				pseudoP3.innerText = currentTournament.getCurrentState().pseudo.player3;
			if (pseudoP4)
				pseudoP4.innerText = currentTournament.getCurrentState().pseudo.player4;
		}
	}
}

export function stopTournament()
{
	net?.disconnect();
	net = null;
}
