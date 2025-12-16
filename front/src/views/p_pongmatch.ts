import { GameRenderer } from "../game/gameRenderer";
import { GameNetwork } from "../game/gameNetwork";
import { genericFetch, loadHeader, navigateTo } from "../router";
import { GameInstance } from "../game/gameInstance";

let renderer: GameRenderer | null = null;
let net: GameNetwork | null = null;
let currentGame: GameInstance | null = null;

export function PongMatchView(params?: any): string {
	loadHeader();
	return (document.getElementById("pongmatchhtml") as HTMLTemplateElement).innerHTML;
}

export async function initPongMatch(params?: any) {
	const gameID: string = params?.id;
	const replayBtn = document.getElementById("replay-btn");
	const dashboardBtn = document.getElementById("dashboard-btn");
	const pseudoP1 = document.getElementById("player1-name");
	const pseudoP2 = document.getElementById("player2-name");

	const res = await genericFetch("/api/private/game/playerinfo");
	const resType = await genericFetch("/api/private/game/type", {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			gameId: gameID
		})
	});

	const { playerId } = res;
	const type = resType.type;

	const serverUrl = window.location.host;
	let input1: "up" | "down" | "stop" = "stop";
	let input2: "up" | "down" | "stop" = "stop";
	let input: "up" | "down" | "stop" = "stop";

	// 1. Create game for client
	currentGame = new GameInstance();

	// 2. Prepare drawing system
	renderer = new GameRenderer();

	if (type == "Local")
	{
		currentGame.enableLocalMode();
	}
	// 3. Connect to server
	net = new GameNetwork(serverUrl, Number(gameID));

	//4. set role (player 1 or 2)
	net.onRole((role) => {
		if (net)
			currentGame?.setNetwork(net, role);
	});

	// 5. Join game room
	net.join(Number(gameID), Number(playerId));

	net.onCountdown(() => {
		let countdown = 4;
		const interval = setInterval(() => {
			if (!currentGame || !renderer)
				return;
			updatePseudo();
			renderer.drawCountdown(currentGame.getCurrentState(), countdown);
			countdown--;
			if (countdown < 0) {
				clearInterval(interval);
				if (net)
					net.startGame();
			}
		}, 1000);
	});

	net.onPredraw((state) => {
		if (!currentGame || !renderer)
			return;

		currentGame.applyServerState(state);
		updatePseudo();

		renderer.draw(currentGame.getCurrentState(), false);
	})

	// 6. Receive game state from server
	net.onState((state) => {
		if (!currentGame || !renderer)
			return;

		//update local state
		currentGame.applyServerState(state);
		updatePseudo();

		//draw actual state
		renderer.draw(currentGame.getCurrentState(), true);
		updateInput();
	});

	// 7. Send inputs to server
	const keyState: { [key: string]: boolean } = {};
	const keyState2: { [key: string]: boolean } = {};

	window.addEventListener("keydown", (e) => {
		keyState[e.key] = true;
		keyState2[e.key] = true;
	});

	window.addEventListener("keyup", (e) => {
		keyState[e.key] = false;
		keyState2[e.key] = false;
	});

	function updateInput()
	{
		if (!currentGame) return;

		if (currentGame.getCurrentState().status == "playing")
		{
			if (currentGame.isLocalMode())
			{
				//player1
				if ((keyState["w"] || keyState["W"]) && input1 != "up")
					input1 = "up";
				else if ((keyState["s"] || keyState["S"]) && input1 != "down")
					input1 = "down";
				else if (input1 != "stop")
					input1 = "stop";
				currentGame.sendInput(input1, "player1");

				//player2
				if (keyState2["ArrowUp"] && input2 != "up")
					input2 = "up";
				else if (keyState2["ArrowDown"] && input2 != "down")
					input2 = "down";
				else if (input2 != "stop")
					input2 = "stop";
				currentGame.sendInput(input2, "player2");
			}
			else
			{
				if ((keyState["w"] || keyState["W"]) && input != "up")
					input = "up";
				else if ((keyState["s"] || keyState["S"]) && input != "down")
					input = "down";
				else if (input != "stop")
					input = "stop";

				currentGame.sendInput(input);
			}
		}
	}

	function updatePseudo() {
		if (currentGame)
		{
			if (pseudoP1)
				pseudoP1.innerText = currentGame.getCurrentState().pseudo.player1;
			if (pseudoP2)
				pseudoP2.innerText = currentGame.getCurrentState().pseudo.player2;
		}
	}

	net.onGameOver(() => {
		if (!currentGame || !renderer)
			return;
		renderer.drawGameOver(currentGame.getCurrentState());
		if (currentGame.isLocalMode())
		{
			replayBtn?.addEventListener("click", async () => {
				navigateTo(`/gamelocal`);
			});
		}
		else
		{
			replayBtn?.addEventListener("click", async () => {
				navigateTo(`/gameonline`);
			});
		}
		dashboardBtn?.addEventListener("click", async () => {
			navigateTo(`/dashboard`);
		});
	});
}

export function stopGame()
{
	net?.disconnect();
	net = null;
	renderer = null;
	currentGame = null;
}
