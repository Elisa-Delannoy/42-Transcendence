import { GameInstance } from "./gameInstance";

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
	// currentGame.start();
}

let currentGame: GameInstance | null = null;

declare global {
	interface Window {
		stopGame: () => void;
	}
}

//global function to stop game correctly
window.stopGame = function () {
	if (currentGame) {
		currentGame.destroy();
		currentGame = null;
	}
};

export {};
