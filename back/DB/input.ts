import { friends, gameInfo, generalChat, users, users_achivements, users_stats } from "../server";
import bcrypt from "bcryptjs";

const newU: [string, number][] = [
	["42", 1240],
	["Alice", 1240],
	["Bruno", 1985],
	["Camille", 760],
	["David", 2210],
	["Emma", 1450],
	["Fabien", 2690],
	["Gaëlle", 980],
	["Hugo", 1870],
	["Inès", 540],
	["Julien", 2140],
	["Karim", 1320],
	["Laura", 1750],
	["Mehdi", 2460],
	["Nina", 890],
	["Olivier", 2010],
	["Paul", 1680],
	["Quentin", 2570],
	["Rania", 1130],
	["Sébastien", 2290],
	["Thomas", 1540],
	["Ulysse", 2760],
	["Valérie", 940],
	["William", 1890],
	["Xavier", 2100],
	["Yasmine", 670],
	["Zacharie", 1340],
	["Adrien", 1620],
	["Béatrice", 2480],
	["Cédric", 520],
	["Delphine", 1960],
	["Étienne", 2710],
	["Florence", 1180],
	["Guillaume", 2050],
	["Helena", 880],
	["Ismaël", 2330],
	["Jessica", 1490],
	["Kévin", 1710],
	["Léa", 610],
	["Mathieu", 1940],
	["Noémie", 1270],
	["Oscar", 2190],
	["Patricia", 1010],
	["Rémi", 1830],
	["Sonia", 1560],
	["Tarek", 2620],
	["Victoria", 910],
	["Walid", 2370],
	["Yann", 1410],
	["Zoé", 590]
];

async function newUsersDB(): Promise <void> {
	const hashedPassword = await bcrypt.hash("42", 12);

	await Promise.all(
		newU.map(async ([pseudo, elo]) => {
			users.addUser(pseudo, `${pseudo}@g.c`, hashedPassword, elo);
			users_stats.addUser((await users.getPseudoUser(pseudo)).user_id);
		})
 	);
}

async function newChatDB(): Promise <void> {
	const chat1 = await users.getIDUser(3);
	await generalChat.addMessageChat(chat1.user_id, chat1.pseudo, "Hello !", '2026-01-19T18:32:41.155Z')
	const chat2 = await users.getIDUser(10);
	await generalChat.addMessageChat(chat2.user_id, chat1.pseudo, "Hey, who wants to play ?", '2026-01-20T18:32:41.155Z')
	const chat3 = await users.getIDUser(15);
	await generalChat.addMessageChat(chat2.user_id, chat1.pseudo, "Yes me let's go!!", '2026-01-20T18:33:41.155Z')
}

async function newfriendDB(): Promise <void> {
		await friends.addFriendship(1, 2);
		await friends.addFriendship(1, 3);
		await friends.addFriendship(4, 1);
		await friends.acceptFriendship(1, 5);
		await friends.acceptFriendship(1, 6);
		await friends.acceptFriendship(1, 7);
		await friends.acceptFriendship(1, 8);
}

async function newGameDB(): Promise <void> {
	await gameInfo.finishGame(1, 15, 11, 0, 45, '2026-01-20 19:12:32', "Online", { winner_elo: 40, loser_elo: -40} );
	await gameInfo.finishGame(32, 1, 11, 0, 45, '2026-01-20 19:30:32', "Online", { winner_elo: 40, loser_elo: -40} );
}

async function newAchievementDB() {
	await users_achivements.unlockAchievement(1, 1);
	await users_achivements.unlockAchievement(1, 2);
	await users_achivements.unlockAchievement(1, 6);

}


export async function newInputDB() {
	await newUsersDB();
	await newChatDB();
	await newGameDB();
	await newfriendDB();
	await newAchievementDB();
}
