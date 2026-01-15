import { navigateTo, genericFetch, loadHeader } from "../router";
import { showToast } from "./show_toast";

export function GameOnlineView(): string {
  	return (document.getElementById("gameonlinehtml") as HTMLTemplateElement).innerHTML;
}

export function GameOnlineinit() {
	const createGameButton = document.getElementById("create-onlinegame");
	createGameButton?.addEventListener("click", async () => {
		const { gameId } = await genericFetch("/api/private/game/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ localMode: false, type: "Online" })
		});
		navigateTo(`/pongmatch/${gameId}`);
	});

	const gameListButton = document.getElementById("display-game-list");
	gameListButton?.addEventListener("click", async () => {
		loadGames();
	});
}

async function loadGames()
{
	const { games } = await genericFetch("/api/private/game/list");
	renderGameList(games);
}

function renderGameList(games: any[]) {
	const container = document.getElementById("game-list");
	if (!container) return;

	if (games.length === 0) {
		container.innerHTML = "<p>Aucune partie disponible.</p>";
		return;
	}

	container.innerHTML = games.map(game => `
	<div class="game-item">
		<p>Game #${game.id}</p>
		<p>Status : ${game.state}</p>
		<p>Date : ${game.createdAt}</p>
		<button data-game-id="${game.id}" class="join-game-btn btn w-32">Rejoindre</button>
	</div>
	`).join("");

	document.querySelectorAll(".join-game-btn").forEach(btn => {
	btn.addEventListener("click", async () => {
		const id = (btn as HTMLElement).dataset.gameId;

		try
		{
			const res = await genericFetch("/api/private/game/join", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					gameId: id
				})
			});
			console.log("Saved data:", res);
		} catch (err) {
			console.error("Error saving game:", err);
			showToast(err, "error", 3000);
		}
	
		navigateTo(`/pongmatch/${id}`);
	});
	});
}