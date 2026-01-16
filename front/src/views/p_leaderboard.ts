import { ILeaderboard } from "../../../back/routes/leaderboard/leaderboard";
import { genericFetch, loadHeader } from "../router"

export function LeaderboardView(): string
{
	return((document.getElementById("leaderboard") as HTMLTemplateElement).innerHTML)
}

export async function InitLeaderboard()
{
	const leaderboard: ILeaderboard = await genericFetch("/api/private/leaderboard", {
			method: "GET" });
	const container = document.getElementById("leaderboard-l") as HTMLUListElement;
	console.log(leaderboard);
	if (leaderboard.InfoUsers.length > 0)
	{
		(document.getElementById("avatar-1") as HTMLImageElement).src = leaderboard.InfoUsers[0].avatar;
		(document.getElementById("pseudo-1") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[0].pseudo;
		(document.getElementById("elo-1") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[0].elo.toString() + " 🥐";
	}
	if (leaderboard.InfoUsers.length > 1)
	{
		(document.getElementById("avatar-2") as HTMLImageElement).src = leaderboard.InfoUsers[1].avatar;
		(document.getElementById("pseudo-2") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[1].pseudo;
		(document.getElementById("elo-2") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[1].elo.toString() + " 🥐";
	}
	if (leaderboard.InfoUsers.length > 2)
	{
		(document.getElementById("avatar-3") as HTMLImageElement).src = leaderboard.InfoUsers[2].avatar;
		(document.getElementById("pseudo-3") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[2].pseudo;
		(document.getElementById("elo-3") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[2].elo.toString() + " 🥐";
	}
	for (let i = 3; i < 50; i++)
	{
		const template = document.getElementById("leaderboard-list") as HTMLTemplateElement;
		const li = template.content.cloneNode(true) as DocumentFragment;
		if (i < leaderboard.InfoUsers.length)
		{
			(li.getElementById("avatar") as HTMLImageElement).src = leaderboard.InfoUsers[i].avatar;
			(li.getElementById("pseudo") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[i].pseudo;
			(li.getElementById("elo") as HTMLParagraphElement).textContent = leaderboard.InfoUsers[i].elo.toString() + " 🥐";
			if (leaderboard.user.pseudo === leaderboard.InfoUsers[i].pseudo)
			{
				(li.getElementById("background") as HTMLDivElement).classList.remove("bg-linear-to-r", "from-amber-50", "via-orange-50", "to-yellow-50");
				(li.getElementById("background") as HTMLDivElement).classList.add("bg-linear-to-r", "from-amber-100", "via-orange-100", "to-yellow-100");
			}
		}
		(li.getElementById("position") as HTMLParagraphElement).textContent = "#" + (i+1).toString();
		container.appendChild(li);
	}
	if (leaderboard.InfoUsers.length >= 50 && leaderboard.user.elo < leaderboard.InfoUsers[49].elo)
	{
		(document.getElementById("your-avatar") as HTMLImageElement).src = leaderboard.user.avatar;
		(document.getElementById("your-pseudo") as HTMLParagraphElement).textContent = leaderboard.user.pseudo;
		(document.getElementById("your-elo") as HTMLParagraphElement).textContent = leaderboard.user.elo.toString() + " 🥐";
	}
	else
		(document.getElementById("your-position") as HTMLDivElement).classList.add("hidden");

	console.log(leaderboard);
}