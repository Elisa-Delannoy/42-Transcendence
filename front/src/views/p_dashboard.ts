import { request } from "https";
import { loadHeader } from "../router";
import { contentType } from "mime-types";

export function DashboardView(): string {
	loadHeader();
	return (document.getElementById("dashboardhtml") as HTMLTemplateElement).innerHTML;
}

export async function initDashboard()
{
	const container = document.getElementById("game-list");
	
	if (!container) 
		return;
    try {
    	const response = await fetch(`/api/private/dashboard`, {
								method: "GET"});
			
        const dashboards = await response.json();
        container.innerHTML = "";

        dashboards.forEach(async (game : any) => {
			const template = document.getElementById("history-dashboard") as HTMLTemplateElement;
            const item = document.createElement("div") as HTMLDivElement;
            item.classList.add("dash");
           	const clone = template.content.cloneNode(true);
			item.appendChild(clone);
			container.appendChild(item);
			const winnerpath = document.getElementById("winnerpath") as HTMLImageElement;
			const winnerscore = document.getElementById("winnerscore") as HTMLParagraphElement;
			const winnerpseudo = document.getElementById("winnerpseudo") as HTMLParagraphElement;
			const loserpath = document.getElementById("loserpath") as HTMLImageElement;
			const loserscore = document.getElementById("loserscore") as HTMLParagraphElement;
			const loserpseudo = document.getElementById("loserpseudo") as HTMLParagraphElement;
			const date = document.getElementById("date") as HTMLParagraphElement;
			const duration = document.getElementById("duration") as HTMLParagraphElement;
			winnerpath.src = game.WinnerPath;
			winnerscore.textContent = game.WinnerScore;
			winnerpseudo.textContent = game.WinnerPseudo;
			loserpath.src = game.LoserPath;
			loserscore.textContent = game.LoserScore;
			loserpseudo.textContent = game.LoserPseudo;
			date.textContent = new Date(game.DateGame).toLocaleDateString();
			duration.textContent = "Durée : " + game.GameDuration;
        });
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}
