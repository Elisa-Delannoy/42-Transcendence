import { ManageDB } from "./manageDB";

export interface IUserStats {
    user_id: number;
    games_played: number;
    online_wins: number;
	wins_streak: number;
}


export class UserStats {

	private _db: ManageDB;

	constructor(db: ManageDB)
	{
		this._db = db;
	}

	async createUserStatsTable()
	{
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS user_stats (
				user_id INTEGER PRIMARY KEY,
				games_played INTEGER DEFAULT 0,
				online_wins INTEGER DEFAULT 0,
				wins_streak INTEGER DEFAULT 0
			);
		`);
	}

	async deleteTable()
	{
		const query = `DROP TABLE IF EXISTS user_stats`
		await this._db.execute(query, []);
	}

	async addUser(userId: number)
	{
		await this._db.execute(`
			INSERT OR IGNORE INTO user_stats (user_id, games_played, online_wins, wins_streak)
			VALUES (?, 0, 0, 0);
		`, [userId]);
	}

	async getUserStats(userId: number): Promise<IUserStats>
	{
		const stats:IUserStats = (await this._db.query(`
			SELECT * FROM user_stats WHERE user_id = ?;
		`, [userId]))[0];
		return stats;
	}

	async updateStats(userId: number, games_played: boolean, online_wins: boolean) 
	{
		const fields: string[] = [];

		if (games_played === true)
		{
			fields.push("games_played = games_played + 1");
		}
		if (online_wins === true)
		{
			fields.push("online_wins = online_wins + 10");
			fields.push("wins_streak = wins_streak + 10");
		}
		if (online_wins === false)
		{
			fields.push("wins_streak = 0");
		}
		if (fields.length === 0) return;

		await this._db.execute(`
			UPDATE user_stats SET ${fields.join(", ")} WHERE user_id = ?;
		`, [userId]);
	}
}
