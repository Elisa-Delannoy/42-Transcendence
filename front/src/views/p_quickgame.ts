import { GameInstance } from "./p_game";

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
export function stopGame () {
	if (currentGame)
	{
		currentGame.destroy();
		currentGame = null;
	}
};

export function getCurrentGame() {
	return getCurrentGame;
}
