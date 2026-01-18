import { log } from "console";
import { IAchievement } from "../../../back/DB/achievements";
import { IEndGame } from "../../../back/routes/endgame/endgame";
import { IFriendsAndNot } from "../../../back/routes/friends/friends";
import { achievements } from "../../../back/server";
import { genericFetch, navigateTo } from "../router";
import { showToast } from "./show_toast";

export function endGameView(): string
{
	return (document.getElementById("end-game") as HTMLTemplateElement).innerHTML;
}

export async function InitEndGame()
{
	const state = history.state;
	if (!state || !state.from.includes("pongmatch")) {
		navigateTo("/home");
	}
	try {
		const endgame: IEndGame = await genericFetch("/api/private/endgame", {
					method: "GET" });
		const container = document.getElementById("game-end-container") as HTMLDivElement;
		const templateId: string = `end-game-${endgame.type}`
		const template = document.getElementById(templateId) as HTMLTemplateElement;
	
		const node = template.content.cloneNode(true) as DocumentFragment;
		container.appendChild(node);

		(document.getElementById("winner-id") as HTMLSpanElement).textContent = endgame.gameinfo.winner_pseudo;
		(document.getElementById("winner-score") as HTMLSpanElement).textContent = endgame.gameinfo.winner_score.toString();
		(document.getElementById("loser-id") as HTMLSpanElement).textContent = endgame.gameinfo.loser_pseudo;
		(document.getElementById("loser-score") as HTMLSpanElement).textContent = endgame.gameinfo.loser_score.toString();
		(document.getElementById("final-score") as HTMLParagraphElement).textContent = `${endgame.gameinfo.winner_score} - ${endgame.gameinfo.loser_score}`;
		const addFriend  = document.getElementById("addgamer") as HTMLImageElement;
		const addFriendDark  = document.getElementById("dark-addgamer") as HTMLImageElement;
		if (endgame.friend) {
			addFriend.classList.add("hidden");
			addFriendDark.classList.remove("dark:block");
		}
		if (endgame.gameinfo.type === "Online" || endgame.gameinfo.type === "Tournament")
		{
			(document.getElementById("loser-elo") as HTMLSpanElement).textContent = `- ${Math.abs(endgame.gameinfo.loser_elo)} 🥐`;
			(document.getElementById("winner-elo") as HTMLSpanElement).textContent = `+ ${endgame.gameinfo.winner_elo} 🥐`;
			if (addFriend && addFriendDark && !endgame.friend) {
				[addFriend, addFriendDark].forEach(el => {
					el?.addEventListener("click", async() => {
						if (endgame.type === "victory") {
							await AddFriendEndG(endgame.gameinfo.loser_id, endgame.gameinfo.loser_pseudo);
							if (el === addFriendDark)
								el.classList.remove("dark:block")
							else
								el.classList.add("hidden");
						}
						else {
							await AddFriendEndG(endgame.gameinfo.winner_id, endgame.gameinfo.winner_pseudo);
							if (el === addFriendDark)
								el.classList.remove("dark:block")
							else
								el.classList.add("hidden");
						}
					});
				});
			};
		}

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

		if (!endgame.new_achievements?.length) return;

		if (endgame.new_achievements.length > 0)
		{
			for (const achievement of endgame.new_achievements)
			{
				switch (achievement.rarity)
				{
					case "Common":
						showToast(`You unlock the achievement : ${achievement.title}`, "common-achievement", 5000);
						break;
					case "Rare":
						showToast(`You unlock the achievement : ${achievement.title}`, "rare-achievement", 5000);
						break;
					case "Secret":
						showToast(`You unlock the achievement : ${achievement.title}`, "secret-achievement", 5000);
						break;
				}
			}
		}
	} catch {
	}
}

async function AddFriendEndG(id: number, pseudo: string) {
	try {
		const result = await genericFetch("/api/private/friend/add", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ friendID: id })
		});
		console.log("result notif=", result);
		if (result.message === "added")
			showToast(`Invitation sent to ${pseudo}`, "success");
		else
			showToast(`${pseudo} already sent an invitation`, "warning");
	}
	catch (err) {
		showToast(err, "error", 3000);
	}
}
