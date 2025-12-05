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
            const item = document.createElement("div") as HTMLDivElement;
            item.classList.add("dash");
			console.log("test", game.WinnerPath)
            item.innerHTML = `
                <div class="flex flex-row">
					<img class="rounded-full w-20 h-20" id="profile-avatar" src="${game.WinnerPath}" alt="Your avatar" width="70">
					<section>
					<div class="flex justify-between mb-2">
						<span class="font-semibold">Winner: ${game.WinnerPseudo}</span>
						<span>${new Date(game.GameDate).toLocaleDateString()}</span>
					</div>
					<p class="opacity-80">Winner Score: ${game.WinnerScore}</p>
					<p class="opacity-80">Loser Score: ${game.LoserScore}</p>
					<p class="opacity-60">Duration: ${game.GameDuration}</p>
					</section>
				</div>
            `;

            container.appendChild(item);
        });
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}
