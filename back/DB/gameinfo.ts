import { pseudoRandomBytes } from "crypto";
import { ManageDB } from "./manageDB";

export interface IGameInfo {
	status: string;
	type: "Local" | "AI" | "Online" | "Tournament";
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
	winner_elo: number;
	loser_elo: number;
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
				loser_score INTEGER,
				winner_elo INTEGER,
				loser_elo INTEGER
			)
		`);
	};

	async finishGame(winner_id: number, loser_id: number, winner_score: number,
		loser_score: number, duration_game: number, gameDate: string, type: string, new_elo: {winner_elo: number, loser_elo: number}): Promise<void>
	{
		const query = `
			INSERT INTO game_info (status, winner_id, loser_id,
			 date_game, duration_game, winner_score, loser_score, type, winner_elo, loser_elo)
			VALUES (?,?,?,?,?,?,?,?,?,?)
			`;

		const parameters = [
			GameInfoStatus.finished,
			winner_id,
			loser_id,
			gameDate,
			duration_game,
			winner_score,
			loser_score,
			type,
			new_elo.winner_elo,
			new_elo.loser_elo
		];

		await this._db.execute(query, parameters);
	}

	async getGamesByUser(userId: number): Promise<IGameInfo[]>
	{
		const sql = `
				SELECT 
				gi.status, gi.winner_id, gi.loser_id, gi.type, gi.date_game, gi.duration_game, gi.winner_score, gi.loser_score, gi.winner_elo, gi.loser_elo,
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
			type: row.type,
			winner_id: row.winner_id,
			winner_avatar: row.winner_avatar,
			winner_pseudo: row.winner_pseudo,
			loser_id: row.loser_id,
			loser_avatar: row.loser_avatar,
			loser_pseudo: row.loser_pseudo,
			date_game: row.date_game,
			duration_game: row.duration_game,
			winner_score: row.winner_score,
			loser_score: row.loser_score,
			winner_elo: row.winner_elo,
			loser_elo: row.loser_elo
		}));
	}

	async getLastGame(userId: number): Promise<IGameInfo>
	{
		const rows = await this._db.query(`
			SELECT
				gi.status,
				gi.type,
				gi.winner_id,
				uw.pseudo AS winner_pseudo,
				uw.avatar AS winner_avatar,
				gi.loser_id,
				ul.pseudo AS loser_pseudo,
				ul.avatar AS loser_avatar,
				gi.date_game,
				gi.duration_game,
				gi.winner_score,
				gi.loser_score,
				gi.winner_elo,
				gi.loser_elo
			FROM game_info gi
			LEFT JOIN Users uw ON gi.winner_id = uw.user_id
			LEFT JOIN Users ul ON gi.loser_id = ul.user_id
			WHERE gi.winner_id = :userId OR gi.loser_id = :userId
			ORDER BY gi.date_game DESC
			LIMIT 1;
		`, [ userId ]);

		const row = rows[0];

		const game: IGameInfo = {
			status: row.status,
			type: row.type,
			winner_id: row.winner_id,
			winner_pseudo: row.winner_pseudo,
			winner_avatar: row.winner_avatar,
			loser_id: row.loser_id,
			loser_pseudo: row.loser_pseudo,
			loser_avatar: row.loser_avatar,
			date_game: row.date_game,
			duration_game: row.duration_game,
			winner_score: row.winner_score,
			loser_score: row.loser_score,
			winner_elo: row.winner_elo,
			loser_elo: row.loser_elo,
		};

		return game;
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

	async getTotalScore(userID: number): Promise<{scored: number, taken:number}>
	{
		const sql = `SELECT
			SUM(
				CASE
					WHEN winner_id = ? THEN winner_score
					WHEN loser_id = ? THEN loser_score
					ELSE 0
				END
			) AS total_points_scored,
			SUM(
				CASE
					WHEN winner_id = ? THEN loser_score
					WHEN loser_id = ? THEN winner_score
					ELSE 0
				END
			) AS total_points_taken
			FROM game_info
			WHERE winner_id = ? OR loser_id = ?;
			`;

		const rows = await this._db.query(sql, [userID, userID, userID, userID, userID, userID])

		return { scored: rows[0].total_points_scored, taken: rows[0].total_points_taken };
	}

	async getRecentPlayerNotFriend(id: number): Promise<{ id: number, pseudo: string, avatar: string }[]> {
		const query = `
			SELECT 
				u.user_id AS id,
				u.pseudo,
				u.avatar,
				MAX(gi.date_game) AS last_game
			FROM game_info gi
			JOIN Users u 
				ON u.user_id = CASE 
					WHEN gi.winner_id = ? THEN gi.loser_id
					ELSE gi.winner_id
				END
				AND u.user_id > 0
			LEFT JOIN Friend f 
				ON (
					(f.user_id1 = ? AND f.user_id2 = u.user_id)
					OR (f.user_id2 = ? AND f.user_id1 = u.user_id)
				)
			WHERE 
				(gi.winner_id = ? OR gi.loser_id = ?)
				AND f.user_id1 IS NULL
			GROUP BY 
				u.user_id, u.pseudo, u.avatar
			ORDER BY 
				last_game DESC
			LIMIT 20; `

				
			const players = await this._db.query(query, [id, id, id, id, id]);
			return players;
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
