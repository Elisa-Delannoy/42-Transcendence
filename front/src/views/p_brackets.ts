import { navigateTo, getPreviousPath, getBeforePreviousPath } from "../router";
import { TournamentInstance } from "../tournament/tournamentInstance";
import { TournamentNetwork, TournamentState } from "../tournament/tournamentNetwork";

let net: TournamentNetwork | null = null;
let currentTournament: TournamentInstance | null = null;

export function BracketsView(): string {
	return (document.getElementById("bracketshtml") as HTMLTemplateElement).innerHTML;
}

export async function initBrackets(params?: any) {
	const prev = getPreviousPath();
	let beforePrev = getBeforePreviousPath();
	if (prev === null || beforePrev === null || !beforePrev.startsWith("/tournament") || !prev.startsWith("/brackets"))
	{
		if (!prev.startsWith("/brackets") || !beforePrev.startsWith("/pongmatch"))
		{
			navigateTo("/home");
			return;
		}
	}

	const tournamentID: string = params?.id;
	const startTournamentButton = document.getElementById("start-button");
	const pseudoP1 = document.getElementById("player1-name");
	const pseudoP2 = document.getElementById("player2-name");
	const pseudoP3 = document.getElementById("player3-name");
	const pseudoP4 = document.getElementById("player4-name");
	const finalist1 = document.getElementById("finalist1");
	const finalist2 = document.getElementById("finalist2");
	const champion = document.getElementById("champion");
	const pseudos = [ pseudoP1, pseudoP2, pseudoP3, pseudoP4 ];
	const finalists = [ finalist1, finalist2 ];

	currentTournament = new TournamentInstance();

	net = new TournamentNetwork();

	net.join(Number(tournamentID));

	net.onState((state: TournamentState) => {
		if(!currentTournament)
			return;
		currentTournament.applyServerState(state);
		updatePseudo();
		if (currentTournament.getCurrentState().status == "semifinal")
			net?.SetupSemiFinal();
		else if (currentTournament.getCurrentState().status == "final")
			net?.SetupFinal();
	});

	net.onsetWinner((winner: number, loser: number, status: "semifinal" | "final") => {
		if (status == "semifinal")
		{
			currentTournament?.setWinner(pseudos[winner]);
			currentTournament?.setLoser(pseudos[loser]);
		}
		if (status == "final")
		{
			currentTournament?.setWinner(finalists[winner]);
			currentTournament?.setLoser(finalists[loser]);
		}
	});

	net.onTournamentHost(() => {
		startTournamentButton?.classList.remove("hidden");
		startTournamentButton?.addEventListener("click", async () => {
			net?.startTournament();
			startTournamentButton?.classList.add("hidden");
		});
	});

	net.onStartTournamentGame((gameId: number, tournamentId: number) => {
		navigateTo(`/pongmatch/${gameId}?tournamentId=${tournamentId}`);
	});

	net.onJoinTournamentGame(async (gameId: number, tournamentId: number) => {
		navigateTo(`/pongmatch/${gameId}?tournamentId=${tournamentId}`);
	});

	net.onHostDisconnected(() => {
		net?.changeHost();
	});

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
			if (finalist1)
				finalist1.innerText = currentTournament.getCurrentState().finalists.player1;
			if (finalist2)
				finalist2.innerText = currentTournament.getCurrentState().finalists.player2;
			if (champion)
				champion.innerText = currentTournament.getCurrentState().champion.player;
		}
	}
}

export function stopTournament()
{
	net?.disconnect();
	net = null;
}
