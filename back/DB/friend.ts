import { ManageDB } from "./manageDB";

export class Friend
{
	private _db: ManageDB;

	id: number;
	user_id1: number;
	user_id2: number;
	friendship_date: Date;
	status: FriendshipStatus;

	constructor (db: ManageDB, user_id1: number, user_id2: number)
	{
		this._db = db;
		this.id = 0;
		this.user_id1 = user_id1
		this.user_id2 = user_id2
		this.status = FriendshipStatus.pending;
		this.friendship_date = new Date();
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
			)
		`);
	}

	async addFriendship():Promise<void>
	{
		const query = `
			INSERT INTO Friendship (user_id1, user_id2, friendship_date, status)
			VALUES (?,?,?,?)
		`;
		const parameters = [
		this.user_id1,
		this.user_id2,
		this.friendship_date.toISOString(),
		this.status
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