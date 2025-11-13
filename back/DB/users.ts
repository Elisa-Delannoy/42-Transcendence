import { db } from "../../src/main";
import { ManageDB } from "./manageDB";

export class Users
{
	private _db: ManageDB;

	user_id: number;
	pseudo: string;
	email: string;
	password: string;
	// avatar: string; /*voir pour transformer l image en chemin avant de la stocker*/
	status: UserStatus;
	creation_date: Date;
	modification_date : Date;
	money: number;
	elo: number;

	constructor (db: ManageDB, email: string, pseudo: string, password: string)
	{
		this._db = db;
		this.user_id = 0
		this.pseudo = pseudo;
		this.email = email;
		this.password = password;
		// this.avatar = "";
		this.status = UserStatus.offline;
		this.creation_date = new Date();
		this.modification_date = new Date();
		this.money = 0
		this.elo = 0;
	}

	static async createUserTable(db: ManageDB)
	{
		await db.execute(`
			CREATE TABLE IF NOT EXISTS Users (
				user_id INTEGER PRIMARY KEY AUTOINCREMENT,
                pseudo TEXT NOT NULL,
                email TEXT NOT NULL,
                password TEXT NOT NULL,
                status INTEGER NOT NULL,
                creation_date TEXT NOT NULL,
				modification_date TEXT NOT NULL,
                money INTEGER DEFAULT 0,
                elo INTEGER DEFAULT 0
			)
		`);
	}

	async addUser():Promise<void>
	{
		const query = `
			INSERT INTO Users (pseudo, email, password, status, creation_date, modification_date, money, elo)
			VALUES (?,?,?,?,?,?,?,?)
		`;
		const parameters = [
		this.pseudo,
		this.email,
		this.password,
		// this.avatar,
		this.status,
		this.creation_date.toISOString(),
		this.modification_date.toISOString(),
		this.money,
		this.elo
		];
		
		await this._db.execute(query, parameters);
	}

	static async deleteUserTable(db: ManageDB)
	{
		const query = `DROP TABLE IF EXISTS Users`
		await db.execute(query, []);
	}

	// async modifyProfil(db: ManageDB, key: string, value: string)
	// {
	// 	const query = `
	// 	UPDATE Users
	// 	SET pseudo = ?, password = ?, avatar = ?
	// 	WHERE user_id = ?
	// 	`;

	// 	const parameters 
	// }
}

enum UserStatus
{
	offline, 
	online,
	playing
}