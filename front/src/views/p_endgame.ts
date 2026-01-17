import { IAchievement } from "../../../back/DB/achievements";
import { IEndGame } from "../../../back/routes/endgame/endgame";
import { achievements } from "../../../back/server";
import { genericFetch } from "../router";
import { showToast } from "./show_toast";

export function endGameView(): string
{
	return (document.getElementById("end-game") as HTMLTemplateElement).innerHTML;
}

export async function InitEndGame()
{
	const endgame: IEndGame = await genericFetch("/api/private/endgame", {
				method: "GET" });
	const container = document.getElementById("game-end-container") as HTMLDivElement;
	const templateId: string = `end-game-${endgame.type}`
	const template = document.getElementById(templateId) as HTMLTemplateElement;

	const node = template.content.cloneNode(true) as DocumentFragment;
	container.appendChild(node);

	(document.getElementById("winner-id") as HTMLSpanElement).textContent = endgame.gameinfo.winner_pseudo;
	(document.getElementById("winner-score") as HTMLSpanElement).textContent = endgame.gameinfo.winner_score.toString();
	(document.getElementById("winner-elo") as HTMLSpanElement).textContent = `+ ${endgame.gameinfo.winner_elo} 🥐`;
	(document.getElementById("loser-id") as HTMLSpanElement).textContent = endgame.gameinfo.loser_pseudo;
	(document.getElementById("loser-elo") as HTMLSpanElement).textContent = `- ${Math.abs(endgame.gameinfo.loser_elo)} 🥐`;
	(document.getElementById("loser-score") as HTMLSpanElement).textContent = endgame.gameinfo.loser_score.toString();
	(document.getElementById("final-score") as HTMLParagraphElement).textContent = `${endgame.gameinfo.winner_score} - ${endgame.gameinfo.loser_score}`;

	const replayBtn = document.getElementById("replay-button") as HTMLAnchorElement
	switch (endgame.gameinfo.type)
	{
		case "Online":
			replayBtn.href = "/gameonline";
			break;
		case "AI":
		case "Local":
			replayBtn.href = "/gamelocal";
			break;
		case "Tournament":
			replayBtn.href = "/tournament";
			break;
	}
	
	document.appendChild(node);
}