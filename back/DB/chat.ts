import { pseudoRandomBytes } from "crypto";
import { ManageDB } from "./manageDB";
import { dataChat } from "../../front/src/chat/chatNetwork";


export class Chat
{
    private _db: ManageDB;

    constructor (db: ManageDB)
    {
        this._db = db;
    }

   	async createChatTable()
	{
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS Chat (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL, 
				pseudo TEXT NOT NULL,
				message TEXT NOT NULL,
				date TEXT NOT NULL
			)
		`);
	}

    async addMessageChat(user_id: number, pseudo: string, message: string, date: string): Promise<void>
	{
		const query = `
			INSERT INTO Chat (user_id, pseudo, message, date)
			VALUES (?,?,?,?)
		`;
		const parameters = [
		user_id,
		pseudo,
        message,
		date.replace("T", " ").split(".")[0],
		];
		await this._db.execute(query, parameters);
	}

	async displayHistoryMessage(): Promise <dataChat[]> {
    	const  history = await this._db.query(`SELECT * FROM Chat ORDER BY id ASC`);
		return history;
    }

	async deleteChatTable()
	{
		const query = `DROP TABLE IF EXISTS Chat`
		await this._db.execute(query);
	}
}