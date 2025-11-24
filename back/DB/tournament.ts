import { ManageDB } from "./manageDB";

export class Tournament {
  private _db: ManageDB;

  constructor(db: ManageDB) {
    this._db = db;
  }

  /**
   * Create the tournament table if it doesn't exist
   * Fields:
   * - id: primary key
   * - winner_id ~ eighth_place_id: final ranking of players
   * - onchain: 0 = not uploaded to blockchain, 1 = uploaded
   */
  async createTournamentTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS tournament (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        winner_id INTEGER,
        second_place_id INTEGER,
        third_place_id INTEGER,
        fourth_place_id INTEGER,
        fifth_place_id INTEGER,
        sixth_place_id INTEGER,
        seventh_place_id INTEGER,
        eighth_place_id INTEGER,
        onchain INTEGER DEFAULT 0
      )
    `;
    await this._db.execute(query, []);
  }

  /**
   * Delete the tournament table
   */
  async deleteTournamentTable() {
    const query = `DROP TABLE IF EXISTS tournament`;
    await this._db.execute(query, []);
  }

  /**
   * Insert tournament (auto ID)
   * @param ranking - array of 8 player IDs in order of their final ranking
   */
	async insertTournament(ranking: number[]): Promise<number> {
		const query = `
			INSERT INTO tournament (
				winner_id, second_place_id, third_place_id, fourth_place_id,
				fifth_place_id, sixth_place_id, seventh_place_id, eighth_place_id
			) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		`;

		const result: any = await this._db.runWithResult(query, ranking);
    console.log("New tournament ID =", result.lastID);  /*a supp */
		return result.lastID;
	}

  /**
   * Mark a tournament as uploaded to blockchain
   * @param tournamentId 
   */
  async markOnChain(tournamentId: number): Promise<void> {
    const query = `
      UPDATE tournament
      SET onchain = 1
      WHERE id = ?
    `;
    await this._db.execute(query, [tournamentId]);
  }

  /**
   * Get tournaments pending upload
   */
  async getPendingOnChain(): Promise<any[]> {
    const query = `
      SELECT *
      FROM tournament
      WHERE onchain = 0
      ORDER BY id ASC
    `;
    return await this._db.query(query, []);
  }


  /**
   * Get all tournaments
   */
  async getAllTournaments(): Promise<any[]> {
    return await this._db.query(`SELECT * FROM tournament`);
  }

  /**
   * Optional: get a tournament by ID
   */
  async getTournamentById(tournamentId: number): Promise<any> {
    const query = `
      SELECT *
      FROM tournament
      WHERE id = ?
    `;
    const rows = await this._db.query(query, [tournamentId]);
    return rows.length > 0 ? rows[0] : null;
  }
}
