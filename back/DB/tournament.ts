import { ManageDB } from "./manageDB";

export class Tournament {
  private _db: ManageDB;

  constructor(db: ManageDB) {
    this._db = db;
  }

  /* =====================================================
   * TABLE CREATION
   * ===================================================== */

  async createTournamentTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS tournament (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        status TEXT DEFAULT 'running',
        onchain INTEGER DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;
    await this._db.execute(query, []);
  }

  async createTournamentResultTable() {
    const query = `
      CREATE TABLE IF NOT EXISTS tournament_result (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        tournament_id INTEGER NOT NULL,
        player_id INTEGER NOT NULL,
        rank INTEGER NOT NULL,
        is_ai INTEGER DEFAULT 0,
        UNIQUE (tournament_id, rank),
        FOREIGN KEY (tournament_id) REFERENCES tournament(id)
      )
    `;
    await this._db.execute(query, []);
  }

  async deleteTournamentTables() {
    await this._db.execute(`DROP TABLE IF EXISTS tournament_result`, []);
    await this._db.execute(`DROP TABLE IF EXISTS tournament`, []);
  }

  /* =====================================================
   * TOURNAMENT LIFECYCLE
   * ===================================================== */

  /**
   * Create a new tournament (returns tournamentId)
   */
  async createTournament(): Promise<number> {
    const result: any = await this._db.runWithResult(
      `INSERT INTO tournament (status) VALUES ('running')`,
      []
    );
    return result.lastID;
  }

  /**
   * Save final ranking (rank: 1~4)
   * This should be called ONLY ONCE when tournament ends
   */
  async insertTournamentResults(
    tournamentId: number,
    ranking: number[]
  ): Promise<void> {
    if (ranking.length !== 4) {
      throw new Error("Tournament ranking must contain exactly 4 players");
    }

    await this._db.execute("BEGIN TRANSACTION", []);

    try {
      for (let i = 0; i < ranking.length; i++) {
        const playerId = ranking[i];

        await this._db.execute(
          `
          INSERT INTO tournament_result (tournament_id, player_id, rank, is_ai)
          VALUES (?, ?, ?, ?)
          `,
          [
            tournamentId,
            playerId,
            i + 1,
            playerId === -1 ? 1 : 0
          ]
        );
      }

      await this._db.execute(
        `UPDATE tournament SET status = 'finished' WHERE id = ?`,
        [tournamentId]
      );

      await this._db.execute("COMMIT", []);
    } catch (err) {
      await this._db.execute("ROLLBACK", []);
      throw err;
    }
  }

  /* =====================================================
   * ONCHAIN
   * ===================================================== */

  async markOnChain(tournamentId: number): Promise<void> {
    await this._db.execute(
      `UPDATE tournament SET onchain = 1 WHERE id = ?`,
      [tournamentId]
    );
  }

  async getPendingOnChain(): Promise<any[]> {
    return await this._db.query(
      `
      SELECT *
      FROM tournament
      WHERE status = 'finished' AND onchain = 0
      ORDER BY id ASC
      `,
      []
    );
  }

  /* =====================================================
   * QUERY
   * ===================================================== */

  async getTournamentById(tournamentId: number): Promise<any> {
    const rows = await this._db.query(
      `SELECT * FROM tournament WHERE id = ?`,
      [tournamentId]
    );
    return rows.length ? rows[0] : null;
  }

  async getTournamentResults(tournamentId: number): Promise<any[]> {
    return await this._db.query(
      `
      SELECT player_id, rank, is_ai
      FROM tournament_result
      WHERE tournament_id = ?
      ORDER BY rank ASC
      `,
      [tournamentId]
    );
  }

  async getAllTournaments(): Promise<any[]> {
    return await this._db.query(
      `
      SELECT *
      FROM tournament
      ORDER BY id DESC
      `,
      []
    );
  }
}



