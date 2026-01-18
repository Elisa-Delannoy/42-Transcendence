import { navigateTo, genericFetch } from "../router";

export function GameOnlineView(): string {
  	return (document.getElementById("gameonlinehtml") as HTMLTemplateElement).innerHTML;
}

export function GameOnlineinit() {
	const createGameButton = document.getElementById("create-onlinegame");
	createGameButton?.addEventListener("click", async () => {
		const { gameId } = await genericFetch("/api/private/game/onlinegame", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ localMode: false, type: "Online" })
		});
		if (gameId == -1)
			alert("Your account is already in game.");
		else
			navigateTo(`/pongmatch/${gameId}`);
	});

}
