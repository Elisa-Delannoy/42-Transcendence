import { GameRenderer } from "../game/gameRenderer";
import { GameNetwork } from "../game/gameNetwork";
import { navigateTo, getPreviousPath, getBeforePreviousPath } from "../router";
import { GameInstance } from "../game/gameInstance";
import { showToast } from "./show_toast";

let renderer: GameRenderer | null = null;
let net: GameNetwork | null = null;
let currentGame: GameInstance | null = null;
let interval: NodeJS.Timeout;

export function PongMatchView(params?: any): string {
	return (document.getElementById("pongmatchhtml") as HTMLTemplateElement).innerHTML;
}

export async function initPongMatch(params?: any) {
	const gameID: string = params?.id;
	const paramUrl = new URLSearchParams(window.location.search);
	const tournamentId = paramUrl.get("tournamentId");

	const prev = getPreviousPath();
	let beforePrev = getBeforePreviousPath();
	console.log("prev : ", prev);
	console.log("beforePrev : ", beforePrev);

	const isNull = !prev || !beforePrev;

	console.log("tournamentId : ", tournamentId);
	if (tournamentId)
	{
		const cameFromPongMatch = prev.startsWith("/pongmatch") || beforePrev.startsWith("/pongmatch");
		const allowedBeforePrev = beforePrev.startsWith("/brackets");
		if (isNull || (!cameFromPongMatch && !allowedBeforePrev))
		{
			navigateTo("/home");
			return;
		}
	}
	else
	{
		const cameFromPongMatch = prev.startsWith("/pongmatch") || beforePrev.startsWith("/pongmatch");
		const allowedBeforePrev = beforePrev.startsWith("/gameonline") || beforePrev.startsWith("/gamelocal");
		if (isNull || (!cameFromPongMatch && !allowedBeforePrev))
		{
			navigateTo("/home");
			return;
		}
	}


	const dashboardBtn = document.getElementById("dashboard-btn");
	const pseudoP1 = document.getElementById("player1-name");
	const pseudoP2 = document.getElementById("player2-name");

	let input1: "up" | "down" | "stop" = "stop";
	let input2: "up" | "down" | "stop" = "stop";
	let input: "up" | "down" | "stop" = "stop";

	currentGame = new GameInstance();

	renderer = new GameRenderer();

	if (currentGame.getCurrentState().type == "Local")
		currentGame.enableLocalMode();

	net = new GameNetwork();

	net.onWarning(() => {
		showToast("Next game deconnection will get you kicked from the game.", "warning", 5000);
	});

	net.onKick(() => {
		navigateTo("/home");
		return;
	});

	net.onRole((role) => {
		if (net)
			currentGame?.setNetwork(net, role);
	});

	net.join(Number(gameID), Number(tournamentId));

	net.onCountdown(() => {
		let countdown = 4;
		interval = setInterval(() => {
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

	net.onState((state) => {
		if (!currentGame || !renderer)
			return;

		currentGame.applyServerState(state);
		updatePseudo();

		renderer.draw(currentGame.getCurrentState(), true);
		updateInput();
	});

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
			if (currentGame.getCurrentState().type == "Local")
			{
				if ((keyState["w"] || keyState["W"]) && input1 != "up")
					input1 = "up";
				else if ((keyState["s"] || keyState["S"]) && input1 != "down")
					input1 = "down";
				else if (input1 != "stop")
					input1 = "stop";
				currentGame.sendInput(input1, "player1");

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

	net.onDisconnection(() => {
		if (renderer)
			renderer.drawReconnection();
		clearInterval(interval);
	});

	net.onGameOver(() => {
		if (!currentGame || !renderer)
			return;
		renderer.drawGameOver(currentGame.getCurrentState());
		if (currentGame.getCurrentState().type == "Tournament")
		{
			let countdown = 3;
			interval = setInterval(() => {
			countdown--;
			if (countdown < 0) {
				clearInterval(interval);
				navigateTo(`/brackets/${tournamentId}`);
			}
			}, 1000);
		}
		else if (currentGame.isLocalMode() || currentGame.getCurrentState().type == "AI")
		{
			let countdown = 1;
			interval = setInterval(() => {
			countdown--;
			if (countdown < 0) {
				clearInterval(interval);
				navigateTo(`/endgame`);
			}
			}, 1000);
		}
		else
		{
			let countdown = 1;
			interval = setInterval(() => {
			countdown--;
			if (countdown < 0) {
				clearInterval(interval);
				navigateTo(`/endgame`);
			}
			}, 1000);
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
	clearInterval(interval);
	renderer = null;
	currentGame = null;
}
