import { ManageDB } from "./manageDB";

export interface IUsers {
	user_id: number;
	pseudo: string;
	email: string;
	password: string;
	avatar: string;
	status: string;
	creation_date: Date;
	modification_date: Date;
	money: number;
	elo: number;
	twofa_secret: string;
	twofa_enabled: number;
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
                status TEXT NOT NULL,
                creation_date TEXT NOT NULL,
				modification_date TEXT NOT NULL,
                money INTEGER DEFAULT 0,
				twofa_secret TEXT,
				twofa_enabled INTEGER DEFAULT 0,
                elo INTEGER DEFAULT 0
			)
		`);
	}

	async addUser(pseudo:string, email: string, password: string):Promise<void>
	{
		const query = `
			INSERT INTO Users (pseudo, email, password, avatar, status, creation_date, modification_date, money, twofa_secret, twofa_enabled, elo)
			VALUES (?,?,?,?,?,?,?,?,?,?,?)
		`;
		const parameters = [
		pseudo,
		email,
		password,
		"/files/0.png",
		"online",
		new Date().toISOString().replace("T", " ").split(".")[0],
		new Date().toISOString().replace("T", " ").split(".")[0],
		0,
		"",
		0,
		1000
		];
		await this._db.execute(query, parameters);
	}

	async CreateUserIA()
	{
		const query = `
			INSERT INTO Users (user_id, pseudo, email, password, avatar, status, creation_date, modification_date, money, twofa_secret, twofa_enabled, elo)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
			ON CONFLICT(user_id) DO NOTHING
		`;
		const parameters = [
		-1,
		"AI_Player",
		"ia@ia.ia",
		"iapassiapass",
		"/files/ai.png",
		"online",
		new Date().toISOString().replace("T", " ").split(".")[0],
		new Date().toISOString().replace("T", " ").split(".")[0],
		0,
		"",
		0,
		1000
		];
		await this._db.execute(query, parameters);
	}

	async CreateUserGuest()
	{
		const query = `
			INSERT INTO Users (user_id, pseudo, email, password, avatar, status, creation_date, modification_date, money, twofa_secret, twofa_enabled, elo)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
			ON CONFLICT(user_id) DO NOTHING
		`;
		const parameters = [
		0,
		"Guest",
		"guest@g.g",
		"guestpass",
		"/files/0.png",
		"online",
		new Date().toISOString().replace("T", " ").split(".")[0],
		new Date().toISOString().replace("T", " ").split(".")[0],
		0,
		"",
		0,
		1000
		];
		await this._db.execute(query, parameters);
	}

	async deleteUserTable()
	{
		const query = `DROP TABLE IF EXISTS Users`
		await this._db.execute(query, []);
	}

	async migrateUsersTable() {
		await this._db.execute(`
			ALTER TABLE Users ADD COLUMN twofa_secret TEXT;
		`).catch(() => {});
	
		await this._db.execute(`
			ALTER TABLE Users ADD COLUMN twofa_enabled INTEGER DEFAULT 0;
		`).catch(() => {});
	}
	
	async deleteOneUser(userId: number)
	{
		const query = `
			DELETE FROM Users
			WHERE user_id = ?
		`;
		await this._db.execute(query, [userId]);
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

	async getPseudoFromId(id: number)
	{
		const infos: any[] = await this._db.query(`SELECT pseudo FROM Users WHERE user_id = ?`, [id])
		if (infos.length  === 0)
			return [];
		else
			return infos[0];
	}

	async getEloFromID(id: number) : Promise<number>
	{
		const result = await this._db.query(`SELECT elo FROM Users WHERE user_id = ?`, [id]);
		console.log(result[0].elo);
		return result[0].elo as number;
		
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
		await this._db.execute(`UPDATE Users SET avatar = ? WHERE user_id = ?`, [newAvatar, id]);
		const updatedTime = new Date().toISOString().replace("T", " ").split(".")[0];
		await this._db.query(`UPDATE Users SET modification_date = ? WHERE user_id = ?`, [updatedTime, id]);
	}


	async updateStatus(id: number, status: string): Promise < IUsers> {
		await this._db.execute(`UPDATE Users SET status = ? WHERE user_id = ?`, [status, id]);
		const updatedUser = await this.getIDUser(id);
		return updatedUser;
	}

	calculateElo(eloOpponent: number, eloPlayer: number, playerScore: number, opponentScore: number): number
	{
		const expected = 1 / (1 + Math.pow(10, (eloOpponent - eloPlayer) / 400));

		const score = playerScore > opponentScore ? 1 : 0;

		const diff = Math.abs(playerScore - opponentScore);
		let multiplier = 1;
		if (diff <= 1)
			multiplier = 0.8;
		else if (diff <= 4)
			multiplier = 1.0;
		else if (diff <= 7)
			multiplier = 1.2;
		else
			multiplier = 1.5;
		const eloChange = Math.round(32 * multiplier * (score - expected));
		return eloChange;
	}

	async updateElo(id_win: number, id_loose: number, score_win: number, score_loose: number)
	{
		const eloWin: number = await this.getEloFromID(id_win);
		const eloLoose: number = await this.getEloFromID(id_loose);
		await this._db.execute(`UPDATE Users SET elo = elo + ? WHERE user_id = ?`, [this.calculateElo(eloLoose, eloWin, score_win, score_loose) , id_win]);
		await this._db.execute(`UPDATE Users SET elo = elo + ? WHERE user_id = ?`, [this.calculateElo(eloWin, eloLoose, score_loose, score_win) , id_loose]);
	}

	async addElo(id: number)
	{
		await this._db.execute(`UPDATE Users SET elo = elo + ? WHERE user_id = ?`, [416 , id]);
	}

	async searchMember(pseudo: string, id: number): Promise<IUsers[]> {
		const query = ` SELECT * FROM Users WHERE user_id != ? AND user_id > 0 AND LOWER(pseudo) LIKE LOWER(?) LIMIT 10`; /*faire un join pour status != friend ou voir pour mettre bouton supprimer si friend*/
		const members = await this._db.query(query, [id, `${pseudo}%`])
		return members;
	}

	async setTwoFA(userId: number, secret: string | null = null, enabled: boolean): Promise<void> {
		await this._db.execute(
		  `UPDATE Users SET twofa_secret = ?, twofa_enabled = ? WHERE user_id = ?`,
		  [secret, enabled, userId]
		);
	} 
}
