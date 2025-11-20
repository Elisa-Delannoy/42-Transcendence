import { ManageDB } from "./manageDB";

export async function initDB(db: ManageDB) {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pseudo TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      avatar TEXT NOT NULL DEFAULT 'default.png',
      status INTEGER NOT NULL DEFAULT 0,
      creation_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      modification_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      money INTEGER DEFAULT 0,
      elo INTEGER DEFAULT 0
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS game_info (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      winner_id INTEGER,
      loser_id INTEGER,
      winner_score INTEGER,
      loser_score INTEGER,
      duration_game INTEGER,
      created_by TEXT
    );
  `);

  await db.execute(`
      CREATE TABLE IF NOT EXISTS Friendship (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id1 INTEGER NOT NULL, 
          user_id2 INTEGER NOT NULL,
          friendship_date TEXT NOT NULL,
          status INTEGER NOT NULL
      )
  `);
}
