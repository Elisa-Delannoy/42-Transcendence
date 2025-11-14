import { ManageDB } from "./manageDB";

export class GameInfo
{
	private _db: ManageDB;

	status: GameInfoStatus;
	winner_id: number;
	loser_id: number;
	date_game: Date;
	duration_game: number;
	adversary_name: string;
	winner_score: number;
	loser_score: number;

	constructor(db: ManageDB, winner_id: number, loser_id:number, adversary_name:string)
	{
		this._db = db;
		this.status = GameInfoStatus.stopped;
		this.winner_id = winner_id;
		this.loser_id = loser_id;
		this.date_game = new Date();
		this.duration_game = 0;
		this.adversary_name = adversary_name;
		this.winner_score = 0;
		this.loser_score = 0;
	}

	static async createGameInfoTable(db: ManageDB) {
		await db.execute(`
			CREATE TABLE IF NOT EXISTS game_info (
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				status INTEGER NOT NULL,
				winner_id INTEGER,
				loser_id INTEGER,
				date_game TEXT,
				duration_game INTEGER,
				adversary_name TEXT,
				winner_score INTEGER,
				loser_score INTEGER
			)
		`);
	};

	async addGameInfo(): Promise<void>
	{
		const query = `
			INSERT INTO game_info (status, winner_id, loser_id,
			 date_game, duration_game, adversary_name, winner_score, loser_score)
			VALUES (?,?,?,?,?,?,?,?)
			`;
		const parameters = [
			this.status,
			this.winner_id,
			this.loser_id,
			this.date_game,
			this.duration_game,
			this.adversary_name,
			this.winner_score,
			this.loser_score
		];

		await this._db.execute(query, parameters);
	}
}

enum GameInfoStatus
{
	playing,
	end,
	stopped
}