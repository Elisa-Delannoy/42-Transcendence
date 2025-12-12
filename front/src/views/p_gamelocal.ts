import { navigateTo, genericFetch, loadHeader } from "../router";

export function GameLocalView(): string {
	loadHeader();
	return (document.getElementById("gamelocalhtml") as HTMLTemplateElement).innerHTML;
}

export function GameLocalinit() {
	const pvpButton = document.getElementById("pvp");
	pvpButton?.addEventListener("click", async () => {
		const { gameId } = await genericFetch("/api/private/game/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ localMode: true })
		});
		navigateTo(`/pongmatch/${gameId}?local=1`);
	});

	const pvaiButton = document.getElementById("pvai");
	pvaiButton?.addEventListener("click", async () => {
		const vsAI = true;
		const { gameId } = await genericFetch("/api/private/game/create", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ vsAI }),
		});
		navigateTo(`/pongmatch/${gameId}`);
	});
}
