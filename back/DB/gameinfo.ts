import { ManageDB } from "./manageDB";

export interface IGameInfo {
    status: string;
    winner_id: number;
    loser_id: number;
    date_game: string;
    duration_game: number;
    winner_score: number;
    loser_score: number;
}

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

	async getGamesByUser(userId: number): Promise<IGameInfo[]>
	{
		const sql = `
			SELECT status, winner_id, loser_id, date_game, duration_game, winner_score, loser_score
			FROM game_info
			WHERE winner_id = ? OR loser_id = ?
			ORDER BY date_game DESC
			LIMIT 10
		`;

		const rows = await this._db.query(sql, [userId, userId]);
		
		return rows.map((row: IGameInfo) => ({
			status: row.status,
			winner_id: row.winner_id,
			loser_id: row.loser_id,
			date_game: row.date_game,
			duration_game: row.duration_game,
			winner_score: row.winner_score,
			loser_score: row.loser_score
		}));
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
