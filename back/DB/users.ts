import { ManageDB } from "./manageDB";

export class Users
{
	private _db: ManageDB;

	constructor (db: ManageDB)
	{
		this._db = db;
	}

	async createUserTable()
	{
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS Users (
				user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                pseudo TEXT UNIQUE NOT NULL,
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
		console.log(pseudo, email, password)
		await this._db.execute(query, parameters);
	}

	async deleteUserTable()
	{
		const query = `DROP TABLE IF EXISTS Users`
		await this._db.execute(query, []);
	}

	async getEmailUser(email: string)
	{
		const infos: any[] = await this._db.query(`SELECT * FROM Users WHERE email = ?`, [email])
		if (infos.length  === 0)
			return [];
		else
			return infos[0];
	}

	async getPseudoUser(pseudo: string)
	{
		const infos: any[] = await this._db.query(`SELECT * FROM Users WHERE pseudo = ?`, [pseudo])
		console.log(infos);
		if (infos.length  === 0)
			return [];
		else
			return infos[0];
	}
	async getUserbyId(id: string)
	{
		const infos: any[] = await this._db.query(`SELECT * FROM Users WHERE user_id = ?`, [id])
		console.log(infos);
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