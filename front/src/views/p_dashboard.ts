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
			// console.log("test", game.GameDate)
            item.innerHTML = `
					<!-- WINNER -->
					<div class="flex items-center gap-4 w-1/3">
						<img src="${game.WinnerPath}" alt="winner avatar"
							class="w-16 h-16 rounded-full object-cover border-2 border-green-400">
						
						<div>
							<p class="text-lg font-semibold text-green-300">${game.WinnerPseudo}</p>
							<p class="text-2xl font-bold">${game.WinnerScore}</p>
						</div>
					</div>

					<!-- CENTER : DATE + DURÉE -->
					<div class="flex flex-col items-center w-1/3">
						<p class="text-sm text-gray-300">${new Date(game.DateGame).toLocaleDateString()}</p>
						<p class="text-xs text-gray-400">Durée : ${game.GameDuration}</p>
					</div>

					<!-- LOSER -->
					<div class="flex items-center gap-4 w-1/3 justify-end">
						<div class="text-right">
							<p class="text-lg font-semibold text-red-300">${game.LoserPseudo}</p>
							<p class="text-2xl font-bold">${game.LoserScore}</p>
						</div>

						<img src="${game.LoserPath}" alt="loser avatar"
							class="w-16 h-16 rounded-full object-cover border-2 border-red-400">
					</div>
            `;

            container.appendChild(item);
        });
    } catch (error) {
        console.error("Erreur lors du chargement :", error);
    }
}
