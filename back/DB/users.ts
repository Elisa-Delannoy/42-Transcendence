import { info } from "console";
import { db } from "../../src/main";
import { ManageDB } from "./manageDB";

export class Users
{
	private _db: ManageDB;

	constructor (db: ManageDB)
	{
		this._db = db;
	}

	static async createUserTable(db: ManageDB)
	{
		await db.execute(`
			CREATE TABLE IF NOT EXISTS Users (
				user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                pseudo TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
				avatar TEXT NOT NULL,
                status INTEGER NOT NULL,
                creation_date TEXT NOT NULL,
				modification_date TEXT NOT NULL,
                money INTEGER DEFAULT 0,
                elo INTEGER DEFAULT 0
			)
		`);
	}

	async addUser(pseudo:string, email: string, password: string):Promise<void>
	{
		const query = `
			INSERT INTO Users (pseudo, email, password, avatar, status, creation_date, modification_date, money, elo)
			VALUES (?,?,?,?,?,?,?,?,?)
		`;
		const parameters = [
		pseudo,
		email,
		password,
		"default path",
		UserStatus.offline,
		new Date(),
		new Date(),
		0,
		0
		];
		
		await this._db.execute(query, parameters);
	}

	static async deleteUserTable(db: ManageDB)
	{
		const query = `DROP TABLE IF EXISTS Users`
		await db.execute(query, []);
	}

	async getInfoUser(pseudo: string)
	{
		const infos: any[] = await this._db.query(`SELECT * FROM Users WHERE pseudo = ?`, [pseudo])
		if (infos.length  === 0)
			return [];
		else
			return infos[0];
	}
}

enum UserStatus
{
	offline, 
	online,
	playing
}