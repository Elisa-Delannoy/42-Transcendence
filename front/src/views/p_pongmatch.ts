import { GameRenderer } from "../game/gameRenderer";
import { GameNetwork } from "../game/gameNetwork";
import { loadHeader } from "../router";
import { GameInstance } from "../game/gameInstance";

let renderer: GameRenderer | null = null;
let net: GameNetwork | null = null;
let currentGame: GameInstance | null = null;

export function PongMatchView(params?: any): string {
	loadHeader();
	return (document.getElementById("pongmatchhtml") as HTMLTemplateElement).innerHTML;
}

export function initPongMatch(params?: any) {
	const gameID: string = params?.id;
	const url = new URL(window.location.href);
	const localMode = url.searchParams.get("local") === "1";

	const serverUrl = "https://127.0.0.1:3000";

	// 1. Create game for client
	currentGame = new GameInstance();

	// 2. Prepare drawing system
	renderer = new GameRenderer();

	if (localMode)
		currentGame.enableLocalMode();

	// 3. Connect to server
	net = new GameNetwork(serverUrl, Number(gameID));

	//4. set role (player 1 or 2)
	net.onRole((role) => {
		if (net)
			currentGame?.setNetwork(net, role);
	});

	// 5. Join game room
	net.join(Number(gameID));

	// 6. Receive game state from server
	net.onState((state) => {
		if (!currentGame || !renderer)
			return;

		//update local state
		currentGame.applyServerState(state);

		//draw actual state
		renderer.draw(currentGame.getCurrentState());
	});

	// 7. Send inputs to server
	const keyState: { [key: string]: boolean } = {};

	window.addEventListener("keydown", (e) => {
		keyState[e.key] = true;
	});

	window.addEventListener("keyup", (e) => {
		keyState[e.key] = false;
	});

	function updateInput()
	{
		if (!currentGame) return;

		if (currentGame.isLocalMode()) {
			let input1: "up" | "down" | "stop" = "stop";
			if (keyState["w"] || keyState["W"])
				input1 = "up";
			else if (keyState["s"] || keyState["S"])
				input1 = "down";
			currentGame.sendInput(input1, "player1");

			let input2: "up" | "down" | "stop" = "stop";
			if (keyState["ArrowUp"])
				input2 = "up";
			else if (keyState["ArrowDown"])
				input2 = "down";
			currentGame.sendInput(input2, "player2");
		}
		else {
			let input: "up" | "down" | "stop" = "stop";
			if (keyState["w"] || keyState["W"])
				input = "up";
			else if (keyState["s"] || keyState["S"])
				input = "down";

			currentGame.sendInput(input);
		}
	}

	setInterval(updateInput, 16); // ~60 fps
}

export function stopGame() {
	net?.disconnect();
	net = null;
	renderer = null;
	currentGame = null;
}
