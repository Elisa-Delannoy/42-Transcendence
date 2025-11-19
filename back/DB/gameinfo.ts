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
				date_game TEXT NOT NULL,
				duration_game INTEGER DEFAULT 0,
				adversary_name TEXT NOT NULL,
				winner_score INTEGER,
				loser_score INTEGER
			)
		`);
	};

	async createGame(adversary_name: string): Promise<number>
	{
		const query = `
			INSERT INTO game_info (status, winner_id, loser_id,
			 date_game, duration_game, adversary_name, winner_score, loser_score)
			VALUES (?,NULL,NULL,?,0,?,0,0)
			`;
		const parameters = [
			GameInfoStatus.ongoing,
			new Date(),
			adversary_name
		];

		const lastId = await this._db.runAndReturnId(query, parameters);
		return lastId;
	}

	async finishGame(id: number, winner_id: number, loser_id: number, winner_score: number,
		loser_score: number, duration_game: number): Promise<void>
	{
		const query = `
			UPDATE game_info
			SET status = ?,
			winner_id = ?,
			loser_id = ?,
			winner_score = ?,
			loser_score = ?,
			duration_game = ?
			WHERE game_id = ?
		`;

		const parameters = [
			GameInfoStatus.finished,
			winner_id,
			loser_id,
			winner_score,
			loser_score,
			duration_game,
			id
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
