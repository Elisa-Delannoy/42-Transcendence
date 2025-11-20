import { ManageDB } from "./manageDB";

export class GameInfo
{
	private _db: ManageDB;

	constructor(db: ManageDB)
	{
		this._db = db;
	}

	async createGameInfoTable() {
		await this._db.execute(`
			CREATE TABLE IF NOT EXISTS game_info (
				game_id INTEGER PRIMARY KEY AUTOINCREMENT,
				status INTEGER NOT NULL,
				winner_id INTEGER,
				loser_id INTEGER,
				date_game TEXT,
				duration_game INTEGER DEFAULT 0,
				winner_score INTEGER,
				loser_score INTEGER
			)
		`);
	};

	async finishGame(winner_id: number, loser_id: number, winner_score: number,
		loser_score: number, duration_game: number, gameDate: string): Promise<void>
	{
		const query = `
			INSERT INTO game_info (status, winner_id, loser_id,
			 date_game, duration_game, winner_score, loser_score)
			VALUES (?,?,?,?,?,?,?)
			`;

		const parameters = [
			GameInfoStatus.finished,
			winner_id,
			loser_id,
			gameDate,
			duration_game,
			winner_score,
			loser_score
		];

		await this._db.execute(query, parameters);
	}

	async deleteGameInfoTable()
	{
		const query = `DROP TABLE IF EXISTS game_info`
		await this._db.execute(query, []);
	}
}

enum GameInfoStatus
{
	ongoing,
	finished,
	error
}
