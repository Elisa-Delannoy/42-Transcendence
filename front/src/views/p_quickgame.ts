import { genericFetch } from "../router";
import { GameInstance } from "../game/gameInstance";
import { GameNetwork } from "../game/gameNetwork";
import { io } from "socket.io-client";

let currentGame: GameInstance | null = null;
let net: GameNetwork | null = null;

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

	const serverUrl = "https://localhost:8443";

	// ----------- 2) Création de l’instance de jeu locale ----------------
	currentGame = new GameInstance(gameID);

	// ----------- 3) Création du réseau (WebSocket) ----------------
	net = new GameNetwork(serverUrl, currentGame, Number(gameID));
	net["socket"].on("assignRole", (role: "player1" | "player2") => {
		if (currentGame && net)
			currentGame.setNetwork(net, role);
	});
	// ----------- 4) Connexion à la room du serveur ----------------
	net["socket"].emit("joinGame", gameID);
}

//global function to stop game correctly
export async function stopGame () {
	if (currentGame)
	{
		const id = currentGame.getId();
		currentGame.destroy();
		currentGame = null;
		try
		{
			const res = await genericFetch("/api/private/game/update/status", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					id: id,
					status: "error"
				})
			});
			console.log("Saved data:", res);
		} catch (err) {
			console.error("Error saving game:", err);
		}
	}

	if (net)
		{
		if (net["socket"]) net["socket"].disconnect();
		net = null;
	}
};
