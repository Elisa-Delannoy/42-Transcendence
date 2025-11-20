import { navigateTo } from "../router";

export function GameView(): string {
  return (document.getElementById("gamehtml") as HTMLTemplateElement).innerHTML;
}

export function initGame() {
	const button = document.getElementById("start-quickgame");
	button?.addEventListener("click", async () => {
		const res = await fetch("/api/game/create", {
			method: "POST"
		});
		const { gameId } = await res.json();

		// Redirige vers /game/<id>
		navigateTo(`/quickgame/${gameId}`);
	});
}
