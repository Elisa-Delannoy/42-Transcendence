import { IAchievement } from "../../../back/DB/achievements";
import { AchievementInfo } from "../../../back/routes/achievements/achievementInfo";
import { genericFetch } from "../router";
import { showToast } from "./show_toast";


export function achievementsView(): string
{
	return (document.getElementById("achievementhtml") as HTMLTemplateElement).innerHTML;
}

const rarityBackground: Record<string, string[]> = {
    Common: ["bg-linear-to-r", "from-amber-400", "to-amber-500", "shadow-[0_0_25px_rgba(217,119,6,0.5)]"],
    Rare:   ["bg-linear-to-r", "from-amber-500", "to-orange-500", "shadow-[0_0_25px_rgba(217,119,6,0.5)]"],
    Secret: ["bg-linear-to-r", "from-violet-700", "to-indigo-800", "shadow-[0_0_30px_rgba(124,58,237,0.5)]"]
};


const ACHIEVEMENT_ORDER: string[] = [
	"WIN_10_1V1",
	"PLAY_100",
	"LEVEL_10",
	"NO_DEFEAT",
	"WIN_50_1V1",
	"PLAY_1000",
	"LEVEL_50",
	"SECRET_MASTER"
];

function mapByCode(list?: IAchievement[]): Map<string, IAchievement>
{
	const map = new Map<string, IAchievement>();

	if (!Array.isArray(list)) return map;

	for (const a of list) {
		if (a?.code) {
			map.set(a.code, a);
		}
	}
	return map;
}

export async function initAchievement()
{
	try
	{
		const achievement: AchievementInfo = await genericFetch("/api/private/achievement", {method: "GET"});
		const container1 = document.getElementById("part1") as HTMLElement;
		const container2 = document.getElementById("part2") as HTMLElement;

			console.log(achievement.locked);
		const unlockedMap = mapByCode(achievement.unlocked);
		const lockedMap = mapByCode(achievement.locked);

		const unlockedTemplate = document.getElementById("unlocked-achievement") as HTMLTemplateElement;
		const secretTemplate = document.getElementById("secret-achievement") as HTMLTemplateElement;
		const lockedTemplate = document.getElementById("locked-achievement") as HTMLTemplateElement;

		let i = 1;
		for (const code of ACHIEVEMENT_ORDER) {
			let achievement = unlockedMap.get(code);
			let template: HTMLTemplateElement;

			if (achievement) {
				template = achievement.rarity === "Secret" ? secretTemplate : unlockedTemplate;
			} else {
				achievement = lockedMap.get(code);
				if (!achievement) continue;
				template = achievement.rarity === "Secret" ? secretTemplate : lockedTemplate;
			}


			const node = template.content.cloneNode(true) as DocumentFragment;

			const isUnlocked = unlockedMap.has(code);

			if (achievement.rarity === "Secret" && isUnlocked)
			{
				(node.getElementById("unlock") as HTMLElement).textContent = "UNLOCKED";
				(node.getElementById("img") as HTMLImageElement).src = "/src/image/coupe.png";
			}
			const title = node.getElementById("title") as HTMLElement;
			const description = node.getElementById("description") as HTMLElement;
			const rarity = node.getElementById("rarity") as HTMLElement;
			const effect = node.getElementById("effect") as HTMLElement;

			title.textContent = achievement.rarity === "Secret" && !isUnlocked ? "???" : achievement.title;
			description.textContent = achievement.rarity === "Secret"  && !isUnlocked ? "A secret achievement" : achievement.description;
			rarity.textContent = achievement.rarity;

			effect.classList.add(...rarityBackground[achievement.rarity]);

			(i <= 4 ? container1 : container2).appendChild(node);
			i++;
		}
	}
	catch (err)
	{
		console.log(err);
	}
}