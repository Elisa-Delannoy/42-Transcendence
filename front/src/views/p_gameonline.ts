import { navigateTo, genericFetch } from "../router";
import { showToast } from "./show_toast";

export function GameOnlineView(): string {
  	return (document.getElementById("gameonlinehtml") as HTMLTemplateElement).innerHTML;
}

export function GameOnlineinit() {
	const createGameButton = document.getElementById("create-onlinegame");
	createGameButton?.addEventListener("click", async () => {
		try {
			const { gameId } = await genericFetch("/api/private/game/onlinegame", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ localMode: false, type: "Online" })
			});
			if (gameId == -1)
				showToast("Your account is already in game.", "warning", 5000);
			else
				navigateTo(`/pongmatch/${gameId}`);
		} catch (error) {
		}
	});

}
