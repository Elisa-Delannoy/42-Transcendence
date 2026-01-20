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
	// if (tournamentId)
	// {
	// 	const cameFromPongMatch = prev.startsWith("/pongmatch") || beforePrev.startsWith("/pongmatch");
	// 	const allowedBeforePrev = beforePrev.startsWith("/brackets");
	// 	if (isNull || (!cameFromPongMatch && !allowedBeforePrev))
	// 	{
	// 		navigateTo("/home");
	// 		return;
	// 	}
	// }
	// else
	// {
	// 	const cameFromPongMatch = prev.startsWith("/pongmatch") || beforePrev.startsWith("/pongmatch");
	// 	const allowedBeforePrev = beforePrev.startsWith("/gameonline") || beforePrev.startsWith("/gamelocal");
	// 	if (isNull || (!cameFromPongMatch && !allowedBeforePrev))
	// 	{
	// 		navigateTo("/home");
	// 		return;
	// 	}
	// }


	const pseudoP1 = document.getElementById("player1-name") as HTMLSpanElement;
	const pseudoP2 = document.getElementById("player2-name") as HTMLSpanElement;
	const title = document.getElementById("game-type") as HTMLTitleElement;
	const levelP1 = document.getElementById("player1-lvl") as HTMLSpanElement;
	const levelP2 = document.getElementById("player2-lvl") as HTMLSpanElement;
	const eloP1 = document.getElementById("player1-elo") as HTMLSpanElement;
	const eloP2 = document.getElementById("player2-elo") as HTMLSpanElement;
	const avatarP1 = document.getElementById("player1-avatar") as HTMLImageElement;
	const avatarP2 = document.getElementById("player2-avatar") as HTMLImageElement;

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
			updateFrontGame();
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
		updateFrontGame();

		renderer.draw(currentGame.getCurrentState(), false);
	})

	net.onState((state) => {
		if (!currentGame || !renderer)
			return;

		currentGame.applyServerState(state);
		updateFrontGame();

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

	function updateFrontGame() {
		if (currentGame)
		{
			if (pseudoP1)
				pseudoP1.innerText = currentGame.getCurrentState().users.user1.pseudo;
			if (pseudoP2)
				pseudoP2.innerText = currentGame.getCurrentState().users.user2.pseudo;
			if (title)
				title.textContent = currentGame.getCurrentState().type + " Game";
			avatarP1.src = currentGame.getCurrentState().users.user1.avatar;
			avatarP2.src = currentGame.getCurrentState().users.user2.avatar;
			eloP1.innerText = currentGame.getCurrentState().users.user1.elo.toString();
			eloP2.innerText = currentGame.getCurrentState().users.user2.elo.toString();
			levelP1.innerText = currentGame.getCurrentState().users.user1.lvl.toString();
			levelP2.innerText = currentGame.getCurrentState().users.user2.lvl.toString();
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
