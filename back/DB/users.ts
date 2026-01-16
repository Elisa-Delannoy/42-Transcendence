import { boardInfo, ILeaderboard } from "../routes/leaderboard/leaderboard";
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
	elo: number;
	twofa_secret: string;
	twofa_enabled: number;
	lvl: number;
	xp: number;
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
                pseudo TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL,
				avatar TEXT NOT NULL,
                status TEXT NOT NULL,
                creation_date TEXT NOT NULL,
				modification_date TEXT NOT NULL,
				twofa_secret TEXT,
				twofa_enabled INTEGER DEFAULT 0,
                elo INTEGER DEFAULT 0,
				lvl INTEGER DEFAULT 1,
				xp INTEGER DEFAULT 0
			)
		`);
	}

	async addUser(pseudo:string, email: string, password: string, elo:number=500):Promise<void>
	{
		const query = `
			INSERT INTO Users (pseudo, email, password, avatar, status, creation_date, modification_date, twofa_secret, twofa_enabled, elo, lvl, xp)
			VALUES (?,?,?,?,?,?,?,?,?,?,?,?)
		`;
		const parameters = [
		pseudo,
		email,
		password,
		"/files/0.png",
		"online",
		new Date().toISOString().replace("T", " ").split(".")[0],
		new Date().toISOString().replace("T", " ").split(".")[0],
		"",
		0,
		elo,
		1,
		0
		];
		await this._db.execute(query, parameters);
	}

	async CreateUserIA()
	{
		const query = `
			INSERT INTO Users (user_id, pseudo, email, password, avatar, status, creation_date, modification_date, twofa_secret, twofa_enabled, elo)
			VALUES (?,?,?,?,?,?,?,?,?,?,?)
			ON CONFLICT(user_id) DO NOTHING
		`;
		const parameters = [
		-1,
		"AI",
		"ia@ia.ia",
		"iapassiapass",
		"/files/ai.png",
		"online",
		new Date().toISOString().replace("T", " ").split(".")[0],
		new Date().toISOString().replace("T", " ").split(".")[0],
		"",
		0,
		1000
		];
		await this._db.execute(query, parameters);
	}

	async CreateUserGuest()
	{
		const query = `
			INSERT INTO Users (user_id, pseudo, email, password, avatar, status, creation_date, modification_date, twofa_secret, twofa_enabled, elo)
			VALUES (?,?,?,?,?,?,?,?,?,?,?)
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
		return result[0].elo as number;
		
	}

	async getXpFromID(id: number) : Promise<number>
	{
		const result = await this._db.query(`SELECT xp FROM Users WHERE user_id = ?`, [id]);
		return result[0].xp as number;
	}

	async getLvlFromID(id: number) : Promise<number>
	{
		const result = await this._db.query(`SELECT lvl FROM Users WHERE user_id = ?`, [id]);
		return result[0].lvl as number;
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

	async updateElo(id_win: number, id_lose: number, score_win: number, score_lose: number)
	{
		const eloWin: number = await this.getEloFromID(id_win);
		const eloLose: number = await this.getEloFromID(id_lose);
		await this._db.execute(`UPDATE Users SET elo = elo + ? WHERE user_id = ?`, [this.calculateElo(eloLose, eloWin, score_win, score_lose) , id_win]);
		await this._db.execute(`UPDATE Users SET elo = elo + ? WHERE user_id = ?`, [this.calculateElo(eloWin, eloLose, score_lose, score_win) , id_lose]);
	}

	async addElo(id: number)
	{
		await this._db.execute(`UPDATE Users SET elo = elo + ? WHERE user_id = ?`, [416 , id]);
	}

	async addLvl(id: number)
	{
		await this._db.execute(`UPDATE Users SET lvl = lvl + ? WHERE user_id = ?`, [1 , id]);
	}

	calculateXp(xp: number, score: number, id: number): number
	{
		let xptotal: number = xp + (score * 100);
		while (xptotal > 20000)
		{
			this.addLvl(id);
			xptotal -= 20000;
		}
		return xptotal;
	}

	async updateXp(id_win: number, id_lose: number, score_win: number, score_lose: number)
	{
		const xpWinner: number = await this.getXpFromID(id_win);
		const xpLooser: number = await this.getXpFromID(id_lose);
		await this._db.execute(`UPDATE Users SET xp = ? WHERE user_id = ?`, [this.calculateXp(xpWinner, score_win + 2000, id_win), id_win]);
		await this._db.execute(`UPDATE Users SET xp = ? WHERE user_id = ?`, [this.calculateXp(xpLooser, score_lose + 10, id_lose), id_lose]);
	}

	async searchMember(pseudo: string, id: number): Promise<IUsers[]> {
		const query = ` SELECT * FROM Users WHERE pseudo != 'inactive user' AND user_id != ? AND user_id > 0 AND LOWER(pseudo) LIKE LOWER(?) LIMIT 10`; /*faire un join pour status != friend ou voir pour mettre bouton supprimer si friend*/
		const members = await this._db.query(query, [id, `${pseudo}%`])
		return members;
	}

	async GetLeaderboardInfo(): Promise<boardInfo[]>
	{
		const query = `SELECT pseudo, avatar, elo FROM Users WHERE user_id NOT IN (-1, 0) ORDER BY elo DESC LIMIT 10`;
		const info: boardInfo[] = await this._db.query(query);
		return info;
	}

	async setTwoFA(userId: number, secret: string | null = null, enabled: boolean): Promise<void> {
		await this._db.execute(
		  `UPDATE Users SET twofa_secret = ?, twofa_enabled = ? WHERE user_id = ?`,
		  [secret, enabled, userId]
		);
		const updatedTime = new Date().toISOString().replace("T", " ").split(".")[0];
		await this._db.query(`UPDATE Users SET modification_date = ? WHERE user_id = ?`, [updatedTime, userId]);
	} 
}
