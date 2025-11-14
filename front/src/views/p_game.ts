export function GameView(): string {
  return (document.getElementById("gamehtml") as HTMLTemplateElement).innerHTML;
}

