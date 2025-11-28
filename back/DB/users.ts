import { ManageDB } from "./manageDB";

export interface IUsers {
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
		"0.png",
		UserStatus.offline,
		new Date().toISOString().replace("T", " ").split(".")[0],
		new Date().toISOString().replace("T", " ").split(".")[0],
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

	async getIDUser(id: number): Promise<IUsers>
	{	
		const infos: IUsers[] = await this._db.query(`SELECT * FROM Users WHERE user_id = ?`, [id])
		if (infos.length === 0)
			throw new Error("This ID does not exist")
		else
			return infos[0];
	}

	async updateUsername(id: number, newUsername: string): Promise<IUsers>
	{
		if (!newUsername || newUsername.trim() === '') {
			throw new Error("New username cannot be empty.");
		}
	
		await this._db.query(`UPDATE Users SET pseudo = ? WHERE user_id = ?`, [newUsername, id]);
		const updatedTime = new Date().toISOString().replace("T", " ").split(".")[0];
		await this._db.query(`UPDATE Users SET modification_date = ? WHERE user_id = ?`, [updatedTime, id]);

		const updatedUser = await this.getIDUser(id);
		return updatedUser;
	}

	async updateEmail(id: number, newEmail: string): Promise<IUsers>
	{
		if (!newEmail || newEmail.trim() === '') {
			throw new Error("New username cannot be empty.");
		}
		await this._db.query(`UPDATE Users SET email = ? WHERE user_id = ?`, [newEmail, id]);
		const updatedTime = new Date().toISOString().replace("T", " ").split(".")[0];
		await this._db.query(`UPDATE Users SET modification_date = ? WHERE user_id = ?`, [updatedTime, id]);

		const updatedUser = await this.getIDUser(id);
		return updatedUser;
	}

	async updatePassword(id: number, newPw: string): Promise<IUsers>
	{
		await this._db.query(`UPDATE Users SET password = ? WHERE user_id = ?`, [newPw, id]);
		const updatedTime = new Date().toISOString().replace("T", " ").split(".")[0];
		await this._db.query(`UPDATE Users SET modification_date = ? WHERE user_id = ?`, [updatedTime, id]);

		const updatedUser = await this.getIDUser(id);
		return updatedUser;
	}

	async updateAvatar(id: number, newAvatar: string) {
		await this._db.execute(`UPDATE Users SET avatar = ? WHERE user_id = ?`, [newAvatar, id])
		const updatedTime = new Date().toISOString().replace("T", " ").split(".")[0];
		await this._db.query(`UPDATE Users SET modification_date = ? WHERE user_id = ?`, [updatedTime, id]);
	}
}

enum UserStatus
{
	offline, 
	online,
	playing
}