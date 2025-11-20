import { ManageDB } from "./manageDB";
import { User } from "../models/user.model";

export class Users
{
	private _db: ManageDB;

	constructor (db: ManageDB)
	{
		this._db = db;
	}

	async addUser(user: User):Promise<void>
	{
		const query = `
			INSERT INTO Users (pseudo, email, password)
			VALUES (?,?,?)
		`;
		await this._db.execute(query, [user.pseudo, user.email, user.password]);
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
}
