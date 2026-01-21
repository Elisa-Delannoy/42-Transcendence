import { navigateTo, genericFetch, loadHeader } from "../router";
import { showToast } from "./show_toast";

export function TournamentView(): string {
	 	const html = (document.getElementById("tournamenthtml") as HTMLTemplateElement).innerHTML;
	setTimeout(() => initTournamentPage(), 0);
	return html;
}

// ===================== Events =====================
function initTournamentPage() {
	try {
		const createTournamentBtn = document.getElementById("create-tournament");
		const showBtn = document.getElementById("show-onchain");
		const backBtn = document.getElementById("back-to-home");

		createTournamentBtn?.addEventListener("click", async () => {
			const { tournamentId } = await genericFetch("/api/private/tournament/create", {
				method: "POST"
			});
			if (tournamentId == -1)
				showToast("Your account is already in game.", "warning", 5000);
			else
				navigateTo(`/brackets/${tournamentId}`);
		});

		showBtn?.addEventListener("click", async () => {
			await showDBOnChain();
		});

		backBtn?.addEventListener("click", () => {
			navigateTo("/home");
		});
	} catch (err)  {
	}
}

// ===================== Show DB vs Blockchain =====================
function formatRanking(ranking: number[]): string {
	return ranking
		.map(id => id === -1 ? "AI" : id.toString())
		.join(", ");
}

async function showDBOnChain() {
	try {
		const data = await genericFetch("/api/private/tournament/all");
		const dbPanel = document.getElementById("db-panel");
		const chainPanel = document.getElementById("chain-panel");
		if (!dbPanel || !chainPanel) return;

		dbPanel.innerHTML = data.map((t: any) => `
			<div class="p-2 border-b">
				<p><strong>ID:</strong> ${t.tournamentId}</p>
				<p><strong>Ranking:</strong>  ${Array.isArray(t.ranking) ? formatRanking(t.ranking) : "N/A"} </p>
				<p><strong>On Chain:</strong>
					<span class="${t.onChain ? 'text-green-600' : 'text-red-600'}">
						${t.onChain ? '✅ YES' : '❌ NO'}
					</span>
				</p>
			</div>
		`).join("");

		chainPanel.innerHTML = data.map((t: any) => `
			<div class="p-2 border-b">
				<p><strong>ID:</strong> ${t.tournamentId}</p>
				${t.onChain && Array.isArray(t.blockchainRanking)
					? `<p><strong>Blockchain Ranking:</strong> ${formatRanking(t.blockchainRanking)} </p>`
					: `<p class="text-red-600"><strong>Not On Chain ❌</strong></p>`
				  }				  
			</div>
		`).join("");

	} catch (err) {
		console.error("Error loading DB/Blockchain comparison:", err);
		showToast(err, "error", 2000, "Error loading DB/Blockchain comparison:");
	}
}
