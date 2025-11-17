export function GameView(): string {
  return (document.getElementById("gamehtml") as HTMLTemplateElement).innerHTML;
}

export function initGame() {
	const start = document.getElementById("start-game") as HTMLButtonElement;
	start.addEventListener('click', () => {
	console.log("test");
});
}
