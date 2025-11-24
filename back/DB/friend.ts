import { ManageDB } from "./manageDB";


export interface Friend {
	id: number;
	user_id1: number;
	user_id2: number;
	friendship_date: Date;
	status: FriendshipStatus;
}
export class Friend
{
	private _db: ManageDB;

	constructor (db: ManageDB, user_id1: number, user_id2: number)
	{
		this._db = db;
	}

	static async createFriendTable(db: ManageDB)
	{
		await db.execute(`
			CREATE TABLE IF NOT EXISTS Friendship (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id1 INTEGER NOT NULL, 
				user_id2 INTEGER NOT NULL,
				friendship_date TEXT NOT NULL,
				status INTEGER NOT NULL
		`);
	}

	async addFriendship(user_id1: number, user_id2: number):Promise<void>
	{
		const query = `
			INSERT INTO Friendship (user_id1, user_id2, friendship_date, status)
			VALUES (?,?,?,?)
		`;
		const parameters = [
		user_id1,
		user_id2,
		new Date().toISOString().replace("T", " ").split(".")[0],
		FriendshipStatus.pending
		];
		await this._db.execute(query, parameters);
	}
}

enum FriendshipStatus
{
	pending, 
	accepted,
	blocked
}