import { request } from "https";
import { loadHeader } from "../router";
import { contentType } from "mime-types";
import { gameInfo } from "../../../back/server";
import { IGameInfo } from "../../../back/DB/gameinfo";
import { IDashBoard } from "../../../back/routes/dashboard/dashboard";

export function DashboardView(): string {
	loadHeader();
	return (document.getElementById("dashboardhtml") as HTMLTemplateElement).innerHTML;
}

function winrateCalcul(wins: number, losses: number): string
{
	return (Math.round((wins / (wins + losses)) * 100)).toString();
}

function formatDuration(seconds: number) : string
{
    seconds = Math.floor(seconds); // au cas où

    if (seconds < 60) {
        return `${seconds}s`;
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${minutes}m ${remainingSeconds}s`;
}

export async function initDashboard()
{
	const container = document.getElementById("game-list") as HTMLDivElement;
	
	if (!container) 
		return;
    try {
    	const response = await fetch(`/api/private/dashboard`, {
								method: "GET"});
			
        const dashboards: IDashBoard = await response.json();

        dashboards.GamesInfo.forEach(async (game : IGameInfo) => {
			const template = document.getElementById("history-dashboard") as HTMLTemplateElement;
            const item = document.createElement("div") as HTMLDivElement;
            item.classList.add("dash");
           	const clone = template.content.cloneNode(true) as DocumentFragment;
			const winnerpath = clone.getElementById("winnerpath") as HTMLImageElement;
			const winnerscore = clone.getElementById("winnerscore") as HTMLParagraphElement;
			const winnerpseudo = clone.getElementById("winnerpseudo") as HTMLParagraphElement;
			const loserpath = clone.getElementById("loserpath") as HTMLImageElement;
			const loserscore = clone.getElementById("loserscore") as HTMLParagraphElement;
			const loserpseudo = clone.getElementById("loserpseudo") as HTMLParagraphElement;
			const date = clone.getElementById("date") as HTMLParagraphElement;
			const duration = clone.getElementById("duration") as HTMLParagraphElement;
			const type = clone.getElementById("type") as HTMLParagraphElement;

			winnerpath.src = game.winner_avatar;
			winnerscore.textContent = game.winner_score.toString();
			winnerpseudo.textContent = game.winner_pseudo;
			loserpath.src = game.loser_avatar;
			loserscore.textContent = game.loser_score.toString();
			loserpseudo.textContent = game.loser_pseudo;
			date.textContent = new Date(game.date_game).toLocaleDateString();
			duration.textContent = "Durée : " + formatDuration(game.duration_game);
			type.textContent = game.type;
			
			item.appendChild(clone);
			container.appendChild(item);
			
        });
		
		const winrate = document.getElementById("winrate") as HTMLSpanElement;
		const win = document.getElementById("win") as HTMLSpanElement;
		const loose = document.getElementById("loose") as HTMLSpanElement;

		winrate.textContent = winrateCalcul(dashboards.WinLoose.win, dashboards.WinLoose.loose)  + "%";
		win.textContent = dashboards.WinLoose.win.toString();
		loose.textContent = dashboards.WinLoose.loose.toString();

		const taken = document.getElementById("taken") as HTMLSpanElement;
		const scored = document.getElementById("scored") as HTMLSpanElement;
		const ratio = document.getElementById("ratio") as HTMLSpanElement;

		ratio.textContent = winrateCalcul(dashboards.TotalScore.scored, dashboards.TotalScore.taken) + "%";
		taken.textContent = dashboards.TotalScore.taken.toString();
		scored.textContent = dashboards.TotalScore.scored.toString();
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}
