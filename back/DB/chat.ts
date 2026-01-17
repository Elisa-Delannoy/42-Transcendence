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

	async createChatTableAndTrigger()
	{
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS Chat (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				user_id INTEGER NOT NULL, 
				pseudo TEXT NOT NULL,
				message TEXT NOT NULL,
				date TEXT NOT NULL
			);
		
			CREATE TRIGGER IF NOT EXISTS limit_chat_messages
			AFTER INSERT ON Chat
			BEGIN
				DELETE FROM Chat
				WHERE id NOT IN (
					SELECT id FROM Chat
					ORDER BY date DESC
					LIMIT 25
				);
			END;`);
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
		date,
		];
		await this._db.execute(query, parameters);
	}

	async displayHistoryMessage(): Promise <dataChat[]> {
    	const  history = await this._db.query(`SELECT * FROM Chat ORDER BY id ASC`);
		return history;
    }

	async deleteChatTableAndTrigger()
	{ 
		await this._db.execute(`DROP TRIGGER IF EXISTS limit_chat_messages`);
		await this._db.execute(`DROP TABLE IF EXISTS Chat`);
	}
}