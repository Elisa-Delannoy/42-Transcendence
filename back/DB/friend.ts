import { ManageDB } from "./manageDB";

export interface IFriends {
	id: number;
	user_id1: number;
	user_id2: number;
	friendship_date: Date;
	status: string;
}
export class Friends
{
	private _db: ManageDB;

	constructor (db: ManageDB)
	{
		this._db = db;
	}

	async createFriendsTable()
	{
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS Friend (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id1 INTEGER NOT NULL, 
				user_id2 INTEGER NOT NULL,
				friendship_date TEXT NOT NULL,
				status INTEGER NOT NULL
			)
		`);
	}

	async addFriendship(user_id1: number, user_id2: number): Promise<void>
	{
		const query = `
			INSERT INTO Friend (user_id1, user_id2, friendship_date, status)
			VALUES (?,?,?,?)
		`;
		const parameters = [
		user_id1,
		user_id2,
		new Date().toISOString().replace("T", " ").split(".")[0],
		"pending"
		];
		await this._db.execute(query, parameters);
	}

	async getMyFriends(id: number): Promise<IFriends[]> {
		const friendship: IFriends[] = await this._db.query(
			`SELECT * FROM Friend WHERE user_id1 = ? OR user_id2 = ? ORDER BY friendship_date DESC`, [id, id]);
			// if (friendship.length === 0)
			// 	throw new Error("Not firends yet");
			// else
			return friendship;
	}

	async deleteFriendTable()
	{
		const query = `DROP TABLE IF EXISTS Friend`
		await this._db.execute(query, []);
	}

}



// enum FriendshipStatus
// {
// 	pending, 
// 	accepted,
// 	blocked
// }