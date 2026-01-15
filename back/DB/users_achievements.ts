import { Program } from "typescript";
import { ManageDB } from "./manageDB";

export class UserAchievements {

    private _db: ManageDB;

    constructor(db: ManageDB)
	{
        this._db = db;
    }

    async createUserAchievementsTable()
	{
        await this._db.execute(`
            CREATE TABLE IF NOT EXISTS user_achievements (
                user_id INTEGER NOT NULL,
                achievement_id INTEGER NOT NULL,
                unlocked_at TEXT NOT NULL,
                PRIMARY KEY (user_id, achievement_id),
                FOREIGN KEY (user_id) REFERENCES Users(user_id),
                FOREIGN KEY (achievement_id) REFERENCES achievements(achievement_id)
            );
        `);
    }

	async deleteTable()
	{
		const query = `DROP TABLE IF EXISTS user_achievements`
		await this._db.execute(query, []);
	}

	async getAllAchievmentUnlocked(userId: number)
	{
		return await this._db.query(`
			SELECT achievement_id, unlocked_at
			FROM user_achievements
			WHERE user_id = ?;
		`, [userId]);
	}

	async checkSecretAllAchievement(userId: number): Promise<number>
	{
		const allUnluck = await this.getAllAchievmentUnlocked(userId);
		return allUnluck.length
	}

    async unlockAchievement(userId: number, achievementId: number)
	{
        await this._db.execute(`
            INSERT OR IGNORE INTO user_achievements (user_id, achievement_id, unlocked_at)
            VALUES (?, ?, datetime('now'));
        `, [userId, achievementId]);
    }

    async hasAchievement(userId: number, achievementId: number): Promise<boolean> {
        const row = await this._db.query(`
            SELECT 1 FROM user_achievements
            WHERE user_id = ? AND achievement_id = ?;
        `, [userId, achievementId]);
        return row.length > 0;
    }

    // Récupère tous les achievements débloqués pour un utilisateur
    async getUserAchievements(userId: number) {
        return await this._db.query(`
            SELECT ua.*, a.code, a.title, a.description, a.hidden
            FROM user_achievements ua
            JOIN achievements a ON ua.achievement_id = a.achievement_id
            WHERE ua.user_id = ?
            ORDER BY ua.unlocked_at ASC;
        `, [userId]);
    }
}
