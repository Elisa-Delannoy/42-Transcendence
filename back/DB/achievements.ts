import { AchievementInfo } from "../routes/achievements/achievementInfo";
import { users, users_achivements, users_stats } from "../server";
import { ManageDB } from "./manageDB";

export interface IAchievement {
    achievement_id: number;
    code: string;
    title: string;
    description: string;
    rarity: "Common" | "Rare" | "Secret";
    type: string;
    target: number;
    icon?: string | null;
    hidden: boolean;
    unlocked_at?: string | null;
}

export class Achievements {

	private _db: ManageDB;
	
	constructor (db: ManageDB)
	{
		this._db = db;
	}

	async createAchievementsTable()
	{
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS achievements (
				achievement_id INTEGER PRIMARY KEY AUTOINCREMENT,
				code TEXT UNIQUE NOT NULL,
				title TEXT NOT NULL,
				description TEXT NOT NULL,
				rarity TEXT NOT NULL,
				type TEXT NOT NULL,
				target INTEGER,
				icon TEXT,
				hidden INTEGER DEFAULT 0                
			);
		`);
	}

	async setupAchievements()
	{
		await this._db.execute(`
			INSERT OR IGNORE INTO achievements (code, title, description, rarity, type, target, hidden) VALUES
				('WIN_10_1V1', 'First Blood', 'Win 10 online 1v1 games', 'Common', 'counter', 10, 0),
				('PLAY_100', 'Game Starter', 'Play 100 games', 'Common', 'global', 100, 0),
				('LEVEL_10', 'Beginner Level', 'Reach level 10', 'Common', 'level', 10, 0),
				('NO_DEFEAT', 'Invincible', 'Win 10 games without losing', 'Secret', 'counter', 10, 1),
				('WIN_50_1V1', 'Dominator', 'Win 50 online 1v1 games', 'Rare', 'counter', 50, 0),
				('PLAY_1000', 'Marathon', 'Play 1000 games', 'Rare', 'global', 1000, 0),
				('LEVEL_50', 'Veteran', 'Reach level 50', 'Rare', 'level', 50, 0),
				('SECRET_MASTER', 'Secret Master', 'Unlock all secret achievements', 'Secret', 'boolean', 0, 1);
		`);
	}

	async getLockedAchievements(userId: number): Promise<IAchievement[]>
	{
		return await this._db.query(`
			SELECT a.*
			FROM achievements a
			LEFT JOIN user_achievements ua
				ON ua.achievement_id = a.achievement_id
				AND ua.user_id = ?
			WHERE ua.achievement_id IS NULL;
		`, [userId]);
	}

	async checkAchievementsForUser(userId: number): Promise<IAchievement[]>
	{
		const stats = await users_stats.getUserStats(userId);
		if (!stats) return {} as IAchievement[];
		const level = await users.getLvlFromID(userId);
		const achievements = await this.getLockedAchievements(userId);
		const unlocked = await users_achivements.checkSecretAllAchievement(userId);

		const new_achievements : IAchievement[] = [] as IAchievement[];

		for (const achievement of achievements) {

			let isUnlocked = false;

			switch (achievement.code) {

				case "PLAY_100":
				case "PLAY_1000":
					isUnlocked = stats.games_played >= achievement.target;
					break;

				case "WIN_10_1V1":
				case "WIN_50_1V1":
					isUnlocked = stats.online_wins >= achievement.target;
					break;

				case "LEVEL_10":
				case "LEVEL_50":
					isUnlocked = level >= achievement.target;
					break;
				
				case "SECRET_MASTER":
					isUnlocked = unlocked >= 7;
					break;
				
				case "NO_DEFEAT":
					isUnlocked = stats.wins_streak >= achievement.target;
			}

			if (isUnlocked) {
				await users_achivements.unlockAchievement(userId, achievement.achievement_id);
				new_achievements.push(achievement);
			}
		}
		return new_achievements;
	}

	async deleteTable()
	{
		const query = `DROP TABLE IF EXISTS achievements`
		await this._db.execute(query, []);
	}

	async getAchievementsStatus(userId: number): Promise<AchievementInfo>
	{
		const allAchievements: IAchievement[] = await this._db.query(`
			SELECT *
			FROM achievements
			ORDER BY achievement_id ASC;
		`);

		const unlockedRows = await users_achivements.getAllAchievmentUnlocked(userId);

		const unlockedSet = new Map<number, string>();
		unlockedRows.forEach((row: any) => unlockedSet.set(row.achievement_id, row.unlocked_at));

		const unlocked: IAchievement[] = [];
		const locked: IAchievement[] = [];

		allAchievements.forEach((ach: IAchievement) => {
			if (unlockedSet.has(ach.achievement_id)) {
				unlocked.push({ ...ach, unlocked_at: unlockedSet.get(ach.achievement_id) });
			} else {
				locked.push(ach);
			}
		});

		return { unlocked, locked };
	}

}