import { ManageDB } from "./manageDB";

export interface IMyFriends {	
	id: number;
	avatar: string;
	pseudo: string;
	web_status: "online" | "offline" | "busy";
	friendship_date: string;
	friendship_status: "pending" | "accepted";
	asked_by: number;
}

export class Friends
{
	private _db: ManageDB;

	constructor (db: ManageDB)
	{
		this._db = db;
	}

	async createFriendTable()
	{
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS Friend (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id1 INTEGER NOT NULL, 
				user_id2 INTEGER NOT NULL,
				friendship_date TEXT NOT NULL,
				status INTEGER NOT NULL,
				asked_by INTEGER NOT NULL
			)
		`);
	}

	async addFriendship(user_id1: number, user_id2: number): Promise<void>
	{
		const query = `
			INSERT INTO Friend (user_id1, user_id2, friendship_date, status, asked_by)
			VALUES (?,?,?,?,?)
		`;
		const parameters = [
		user_id1,
		user_id2,
		new Date().toISOString(),
		"pending",
		user_id1
		];
		await this._db.execute(query, parameters);
	}

	async getMyFriends(id: number): Promise<IMyFriends[]> {
		const friendship: IMyFriends[] = await this._db.query(
		`SELECT 
			f.friendship_date, f.status AS friendship_status, f.asked_by, u.pseudo, u.avatar, u.status AS web_status,
				CASE
					WHEN f.user_id1 = ? THEN f.user_id2
					ELSE f.user_id1
				END AS id
			FROM Friend AS f
			JOIN Users AS u ON u.user_id = 
				CASE
					WHEN f.user_id1 = ? THEN f.user_id2
					ELSE f.user_id1
				END
			WHERE (f.user_id1 = ? OR f.user_id2 = ?) AND (f.user_id1 > 0 AND f.user_id2 > 0)
			ORDER BY f.friendship_date DESC;`, [id, id, id, id]);
			return friendship;
	}

	async deleteFriendTable()
	{
		const query = `DROP TABLE IF EXISTS Friend`
		await this._db.execute(query, []);
	}

	async acceptFriendship(id1: number, id2: number): Promise<void>
	{
		await this._db.execute(`UPDATE Friend SET status = 'accepted' WHERE user_id1 = ? AND user_id2 = ?`, [id1, id2]);	
		const updatedTime = new Date().toISOString();
		await this._db.query(`UPDATE Friend SET friendship_date = ? WHERE user_id1 = ? AND user_id2 = ?`, [updatedTime, id1, id2]);
	}

	async deleteFriendship(id1: number, id2: number): Promise<void>
	{
		await this._db.execute(`DELETE FROM Friend WHERE (user_id1 = ? AND user_id2 = ?) OR (user_id1 = ? AND user_id2= ?)`, [id1, id2, id2, id1]);	
	}
}

