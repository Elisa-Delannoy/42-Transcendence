import { ManageDB } from "./manageDB";

export interface Users {
	user_id: number;
	pseudo: string;
	email: string;
	password: string;
	avatar: string;
	status: UserStatus;
	creation_date: Date;
	modification_date: Date;
	money: number;
	elo: number;
}

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
		if (infos.length  === 0)
			return [];
		else
			return infos[0];
	}

	async getIDUser(id: number): Promise<Users>
	{
		
		const infos: Users[] = await this._db.query(`SELECT * FROM Users WHERE user_id = ?`, [id])
		if (infos.length === 0)
			throw new Error("This ID does not exist")
		else
			return infos[0];
	}

	async updateUsername(id: number, newUsername: string): Promise<Users>
	{
		console.log("db: id, newUname", id, newUsername);
		if (!newUsername || newUsername.trim() === '') {
			throw new Error("New username cannot be empty.");
		}
		const updateResult = await this._db.query(`UPDATE Users SET pseudo = ? WHERE user_id = ?`, [newUsername, id]);

		const updatedUser = await this.getIDUser(id);
		console.log('updated username:', updatedUser.pseudo)
		return updatedUser;
	}
}

enum UserStatus
{
	offline, 
	online,
	playing
}