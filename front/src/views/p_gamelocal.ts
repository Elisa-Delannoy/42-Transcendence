import { navigateTo, genericFetch, loadHeader } from "../router";

export function GameLocalView(): string {
	return (document.getElementById("gamelocalhtml") as HTMLTemplateElement).innerHTML;
}

export function GameLocalinit() {
	const pvpButton = document.getElementById("pvp");
	pvpButton?.addEventListener("click", async () => {
		try {
			const { gameId } = await genericFetch("/api/private/game/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ localMode: true, type: "Local" })
			});
			navigateTo(`/pongmatch/${gameId}`);
		} catch (error) {
		}
	});

	const pvaiButton = document.getElementById("pvai");
	pvaiButton?.addEventListener("click", async () => {
		try {
			const vsAI = true;
			const { gameId } = await genericFetch("/api/private/game/create", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ vsAI ,type: "Local" }),
			});
			navigateTo(`/pongmatch/${gameId}`);
		} catch (err) {
		}
	});
}
