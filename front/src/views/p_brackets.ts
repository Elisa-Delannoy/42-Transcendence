import { navigateTo, genericFetch, loadHeader } from "../router";
import { TournamentInstance } from "../tournament/tournamentInstance";
import { TournamentNetwork, TournamentState } from "../tournament/tournamentNetwork";

let net: TournamentNetwork | null = null;
let currentTournament: TournamentInstance | null = null;

export function BracketsView(): string {
	return (document.getElementById("bracketshtml") as HTMLTemplateElement).innerHTML;
}

export async function initBrackets(params?: any) {
	const tournamentID: string = params?.id;
	const startTournamentButton = document.getElementById("start-button");
	const pseudoP1 = document.getElementById("player1-name");
	const pseudoP2 = document.getElementById("player2-name");
	const pseudoP3 = document.getElementById("player3-name");
	const pseudoP4 = document.getElementById("player4-name");
	const finalist1 = document.getElementById("finalist1");
	const finalist2 = document.getElementById("finalist2");
	const champion = document.getElementById("champion");

	const id = await genericFetch("/api/private/game/playerinfo");

	const serverUrl = window.location.host;

	currentTournament = new TournamentInstance();

	net = new TournamentNetwork(serverUrl);

	net.join(Number(tournamentID), Number(id.playerId));

	net.onState((state: TournamentState) => {
		if(!currentTournament)
			return;
		currentTournament.applyServerState(state);
		updatePseudo();
		console.log("currentTournament.getCurrentState().status : ", currentTournament.getCurrentState().status);
		if (currentTournament.getCurrentState().status == "semifinal")
			net?.SetupSemiFinal();
		else if (currentTournament.getCurrentState().status == "final" && currentTournament.getCurrentState().finalists.player1 != "Winner 1" && currentTournament.getCurrentState().finalists.player2 != "Winner 2")
			net?.SetupFinal();
	});

	net.onTournamentHost((playerId: number) => {
		if (playerId == id.playerId)
		{
			startTournamentButton?.classList.remove("hidden");
			startTournamentButton?.addEventListener("click", async () => {
				net?.startTournament();
				startTournamentButton?.classList.add("hidden");
			});
		}
	});

	net.onStartTournamentGame(async (ennemyId: number, gameId: number) => {
		startTournamentButton?.classList.add("hidden");
		let idGame;
		console.log("start game : ");
		if (Number(ennemyId) == 1)
		{
			const vsAI = true;
			const id = await genericFetch("/api/private/tournament/game/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ vsAI, type: "Tournament", tournamentID, gameId: gameId })
			});
			idGame = Number(id.id);
		}
		else
		{
			const id = await genericFetch("/api/private/tournament/game/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ localMode: false, type: "Tournament", tournamentID, gameId: gameId })
			});
			idGame = Number(id.id);
			console.log("id final : ", idGame);
		}
		navigateTo(`/pongmatch/${idGame}?tournamentId=${tournamentID}`);
	});

	net.onJoinTournamentGame(async (ennemyId: number, gameId: number) => {
		console.log("join game : ");
		const id = await genericFetch("/api/private/tournament/game/join", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				gameId: gameId,
				tournamentID: tournamentID
			})
		});
		const idGame = Number(id.id);
		console.log("id final : ", idGame);
		console.log("id final : ", id);
		navigateTo(`/pongmatch/${idGame}?tournamentId=${tournamentID}`);
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
