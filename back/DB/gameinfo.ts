import { ManageDB } from "./manageDB";

export interface IGameInfo {
    status: string;
    winner_id: number;
	winner_pseudo: string;
	winner_avatar: string;
    loser_id: number;
	loser_pseudo: string;
	loser_avatar: string;
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
				id INTEGER PRIMARY KEY AUTOINCREMENT,
				status INTEGER NOT NULL,
				type TEXT,
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
		loser_score: number, duration_game: number, gameDate: string, type: string): Promise<void>
	{
		const query = `
			INSERT INTO game_info (status, winner_id, loser_id,
			 date_game, duration_game, winner_score, loser_score, type)
			VALUES (?,?,?,?,?,?,?,?)
			`;

		const parameters = [
			GameInfoStatus.finished,
			winner_id,
			loser_id,
			gameDate,
			duration_game,
			winner_score,
			loser_score,
			type
		];

		await this._db.execute(query, parameters);
	}

	async getGamesByUser(userId: number): Promise<IGameInfo[]>
	{
		const sql = `
				SELECT 
				gi.status, gi.winner_id, gi.loser_id, gi.date_game, gi.duration_game, gi.winner_score, gi.loser_score,
				uw.pseudo AS winner_pseudo,
				uw.avatar AS winner_avatar,
				ul.pseudo AS loser_pseudo,
				ul.avatar AS loser_avatar
				FROM game_info gi
				LEFT JOIN users uw ON gi.winner_id = uw.user_id
				LEFT JOIN users ul ON gi.loser_id = ul.user_id
				WHERE gi.winner_id = ? OR gi.loser_id = ?
				ORDER BY gi.date_game DESC
				LIMIT 20;

		`;

		const rows = await this._db.query(sql, [userId, userId]);
		
		return rows.map((row: IGameInfo) => ({
			status: row.status,
			winner_id: row.winner_id,
			winner_avatar: row.winner_avatar,
			winner_pseudo: row.winner_pseudo,
			loser_id: row.loser_id,
			loser_avatar: row.loser_avatar,
			loser_pseudo: row.loser_pseudo,
			date_game: row.date_game,
			duration_game: row.duration_game,
			winner_score: row.winner_score,
			loser_score: row.loser_score
		}));
	}

	async getWinsLosses(userId: number) : Promise<{win:number; loose:number}>
	{
				const sql = `
				SELECT
					(SELECT COUNT(*) FROM game_info WHERE winner_id = ?) AS total_wins,
					(SELECT COUNT(*) FROM game_info WHERE loser_id = ?) AS total_losses;
		`;

		const rows = await this._db.query(sql, [userId, userId]);
		
		return { win: rows[0].total_wins, loose: rows[0].total_losses };
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
