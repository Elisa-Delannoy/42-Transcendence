import { IGameInfo } from "../../../back/DB/gameinfo"
import { IDashBoard } from "../../../back/routes/dashboard/dashboard";
import { showToast } from "./show_toast";

export function DashboardView(): string {
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

const ranks = [
	{ min: 0, max: 400, src: "/src/image/rank1.png", type: "Wood" },
	{ min: 400, max: 800, src: "/src/image/rank2.png", type: "Iron" },
	{ min: 800, max: 1200, src: "/src/image/rank3.png", type: "Bronze" },
	{ min: 1200, max: 1600, src: "/src/image/rank4.png", type: "Silver" },
	{ min: 1600, max: 2000, src: "/src/image/rank5.png", type: "Gold" },
	{ min: 2000, max: Infinity, src: "/src/image/rank6.png", type: "Champion" }
];

type RankInfo = {
	src: string;
	next: number;
	progress: number; 
	type: string;
};

function getRankInfo(elo: number): RankInfo
{
	for (const rank of ranks)
	{
		if (elo < rank.max) {
			const progress =
				rank.max === Infinity
					? 100
					: Math.floor(((elo - rank.min) / (rank.max - rank.min)) * 100);
			return {
				src: rank.src,
				next: rank.max === Infinity ? 0 : rank.max - elo,
				progress,
				type: rank.type
			};
		}
	}
	return { src: "/src/image/rank6.png" , next: 0, progress: 100, type: "Champion" };
}

const rankColors: Record<string, string> = {
	Wood: "border-stone-400",
	Iron: "border-orange-500",
	Bronze: "border-amber-600",
	Silver: "border-gray-400",
	Gold: "border-yellow-400",
	Champion: "border-purple-500"
};

const progressionColors: Record<string, string> = {
	Wood: "bg-linear-to-br from-orange-800 via-amber-700 to-yellow-800",
	Iron: "bg-linear-to-br from-neutral-700 via-neutral-500",
	Bronze: "bg-linear-to-br from-yellow-700 via-amber-600 to-orange-700",
	Silver: "bg-linear-to-br from-gray-200 via-white to-gray-300",
	Gold: "bg-linear-to-br from-amber-400 via-yellow-500 to-amber-600",
	Champion: "bg-linear-to-br from-purple-600 via-violet-500 to-fuchsia-600"
};

export async function initDashboard()
{
	const container = document.getElementById("game-list") as HTMLDivElement;
	
	if (!container) 
		return;
    try {
    	const response = await fetch(`/api/private/dashboard`, {
								method: "GET"});
			
        const dashboards: IDashBoard = await response.json();
		
		if (dashboards.GamesInfo.length > 0)
		{
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
		}
		else
		{
			const item = document.createElement("p") as HTMLParagraphElement;
			item.textContent = "Go play some game newbie !";
			item.classList.add("text-center");
			item.classList.add("text-3xl");
			item.classList.add("mt-68");
			container.appendChild(item);
		}
		
		
		if (dashboards.WinLoose.win > 0 && dashboards.WinLoose.loose > 0)
		{
			const winrate = document.getElementById("winrate") as HTMLSpanElement;
			const win = document.getElementById("win") as HTMLSpanElement;
			const loose = document.getElementById("loose") as HTMLSpanElement;
			winrate.textContent = winrateCalcul(dashboards.WinLoose.win, dashboards.WinLoose.loose)  + "%";
			win.textContent = dashboards.WinLoose.win.toString();
			loose.textContent = dashboards.WinLoose.loose.toString();
		}

		if (dashboards.TotalScore.scored > 0 && dashboards.TotalScore.taken > 0)
		{
			const taken = document.getElementById("taken") as HTMLSpanElement;
			const scored = document.getElementById("scored") as HTMLSpanElement;
			const ratio = document.getElementById("ratio") as HTMLSpanElement;
			ratio.textContent = winrateCalcul(dashboards.TotalScore.scored, dashboards.TotalScore.taken) + "%";
			taken.textContent = dashboards.TotalScore.taken.toString();
			scored.textContent = dashboards.TotalScore.scored.toString();
		}

		const rankinfo: RankInfo = getRankInfo(dashboards.Elo);
		(document.getElementById("rank-img") as HTMLImageElement).src = rankinfo.src;
		(document.getElementById("rank-img") as HTMLImageElement).classList.add(rankColors[rankinfo.type]);
		(document.getElementById("rank-player") as HTMLParagraphElement).classList.add(rankinfo.type);
		(document.getElementById("rank-player") as HTMLParagraphElement).textContent = rankinfo.type;
		(document.getElementById("elo-player") as HTMLParagraphElement).textContent = dashboards.Elo.toString();
		(document.getElementById("elo-next") as HTMLParagraphElement).textContent = rankinfo.next.toString();
		setTimeout(() => {
			const bar = document.getElementById("progress-fill") as HTMLDivElement;
			bar.style.width = `${rankinfo.progress}%`;
			bar.classList.add(...progressionColors[rankinfo.type].split(" "));
		}, 50);

    } catch (error) {
        console.error("Erreur lors du chargement :", error);
		showToast("Loading failed. Please try again later.", "error", 3000);
    }
}
