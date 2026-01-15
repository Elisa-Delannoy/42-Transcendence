import { navigateTo, genericFetch, loadHeader } from "../router";
import { showToast } from "./show_toast";

export function TournamentView(): string {
	 	const html = (document.getElementById("tournamenthtml") as HTMLTemplateElement).innerHTML;
	setTimeout(() => initTournamentPage(), 0);
	return html;
}

function generateRandomRanking(): number[] {
	const ranking: number[] = [];
	while (ranking.length < 8) {
		const randomId = Math.floor(Math.random() * 16) + 1;
		if (!ranking.includes(randomId)) {
			ranking.push(randomId);
		}
	}
	return ranking;
}

// ===================== Events =====================
function initTournamentPage() {
	const createTournamentBtn = document.getElementById("create-tournament");
	const joinTournamentBtn = document.getElementById("join-tournament");
	const createBtn = document.getElementById("create-test");
	const showBtn = document.getElementById("show-onchain");
	const backBtn = document.getElementById("back-to-home");

	createTournamentBtn?.addEventListener("click", async () => {
		const { tournamentId } = await genericFetch("/api/private/tournament/create", {
			method: "POST"
		});
		navigateTo(`/brackets/${tournamentId}`);
	});
	
	joinTournamentBtn?.addEventListener("click", async () => {
		loadTournaments();
	});

	createBtn?.addEventListener("click", async () => {
		await testTournamentDB();
	});

	showBtn?.addEventListener("click", async () => {
		await showDBOnChain();
	});

	backBtn?.addEventListener("click", () => {
		navigateTo("/home");
	});
}

async function loadTournaments()
{
	const { tournaments } = await genericFetch("/api/private/tournament/list");
	renderTournamentList(tournaments);
}

function renderTournamentList(tournaments: any[]) {
	const container = document.getElementById("tournament-list");
	if (!container) return;

	if (tournaments.length === 0) {
		container.innerHTML = "<p>Aucun tournoi disponible.</p>";
		return;
	}

	container.innerHTML = tournaments.map(tournament => `
	<div class="tournament-item">
		<p>Tournament #${tournament.id}</p>
		<button data-tournament-id="${tournament.id}" class="join-tournament-btn btn w-32">Rejoindre</button>
	</div>
	`).join("");

	document.querySelectorAll(".join-tournament-btn").forEach(btn => {
	btn.addEventListener("click", async () => {
		const id = (btn as HTMLElement).dataset.tournamentId;

		try
		{
			const res = await genericFetch("/api/private/tournament/join", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					tournamentId: id
				})
			});
			console.log("Saved data:", res);
		} catch (err) {
			console.error("Error saving game:", err);
			showToast(err, "error", 2000, "Error saving game:");
		}

		navigateTo(`/brackets/${id}`);
	});
	});
}

// ===================== Create test result =====================
async function testTournamentDB() {
	const testRanking = generateRandomRanking();
	try {
		const data = await genericFetch("/api/private/tournament/add", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ ranking: testRanking })
		});
		const dbPanel = document.getElementById("db-panel");
		if (dbPanel) {
			dbPanel.innerHTML = `
				<div class="p-2 border-b">
					<p class="text-green-700 font-bold">✅ Tournament Created!</p>
					<p><strong>Ranking:</strong> ${testRanking.join(", ")}</p>
					<p class="text-gray-600 text-sm">(Now stored in database)</p>
				</div>
			`;
		}
		console.log("Tournament response:", data);
	} catch (err) {
		console.error("Error creating tournament:", err);
		showToast(err, "error", 2000, "Error creating tournament:");
	}
}

// ===================== Show DB vs Blockchain =====================
async function showDBOnChain() {
	try {
		const data = await genericFetch("/api/private/tournament/all");
		const dbPanel = document.getElementById("db-panel");
		const chainPanel = document.getElementById("chain-panel");
		if (!dbPanel || !chainPanel) return;

		dbPanel.innerHTML = data.map((t: any) => `
			<div class="p-2 border-b">
				<p><strong>ID:</strong> ${t.tournamentId}</p>
				<p><strong>Ranking:</strong> ${t.ranking.join(", ")}</p>
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
				${t.onChain
					? `<p><strong>Blockchain Ranking:</strong> ${t.blockchainRanking.join(", ")}</p>`
					: `<p class="text-red-600"><strong>Not On Chain ❌</strong></p>`
				}
			</div>
		`).join("");

	} catch (err) {
		console.error("Error loading DB/Blockchain comparison:", err);
		showToast(err, "error", 2000, "Error loading DB/Blockchain comparison:");
	}
}

