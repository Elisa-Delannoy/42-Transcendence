import { navigateTo, genericFetch } from "../router";
import { showToast } from "./show_toast";

export function TournamentView(): string {
	 	const html = (document.getElementById("tournamenthtml") as HTMLTemplateElement).innerHTML;
	setTimeout(() => initTournamentPage(), 0);
	return html;
}

// ===================== Events =====================
function initTournamentPage() {
	const createTournamentBtn = document.getElementById("create-tournament");
	const showBtn = document.getElementById("show-onchain");
	const backBtn = document.getElementById("back-to-home");

	createTournamentBtn?.addEventListener("click", async () => {
		const { tournamentId } = await genericFetch("/api/private/tournament/create", {
			method: "POST"
		});
		if (tournamentId == -1)
			showToast("Your account is already in tournament.", "warning", 4000);
		else
			navigateTo(`/brackets/${tournamentId}`);
	});

	showBtn?.addEventListener("click", async () => {
		navigateTo("/tournamentcheck");
	});

	backBtn?.addEventListener("click", () => {
		navigateTo("/home");
	});
}
