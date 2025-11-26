import { GameInstance } from "./p_game";
import { genericFetch } from "../router";

let currentGame: GameInstance | null = null;

export function QuickGameView(params?: any): string {
  return (document.getElementById("quickgamehtml") as HTMLTemplateElement).innerHTML;
}

export function initQuickGame(params?: any) {
	const gameID: string = params?.id;
	if (currentGame)
	{
		currentGame.destroy();
		currentGame = null;
	}
	//new instance
	currentGame = new GameInstance(gameID);
}

//global function to stop game correctly
export async function stopGame () {
	if (currentGame)
	{
		const id = currentGame.getId();
		console.log("id qg : ", id);
		currentGame.destroy();
		currentGame = null;
		try
		{
			const res = await genericFetch("/api/private/game/error", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: id
				})
			});
			console.log("Saved data:", res);
		} catch (err) {
			console.error("Error saving game:", err);
		}
	}
};

export function getCurrentGame() {
	return getCurrentGame;
}
