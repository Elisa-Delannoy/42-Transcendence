import { error } from 'console';
import sqlite3 from 'sqlite3';

export class ManageDB
{
	private _db: sqlite3.Database | null = null;
	private _path: string;

	constructor(path: string)
	{
		this._path = path
	}

	connect(): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			this._db = new sqlite3.Database(this._path, (error) => 
			{
				if (error) 
					reject(new Error(`Error connexion DB : ${error.message}`));
				else
				{
					console.log("connexion ok"); /*a supp */
					resolve();
				}
			});
		});
	}

	close(): Promise<void>
	{
		return new Promise((resolve, reject) =>
		{
			if (!this._db)
				return resolve();
			this._db.close((error) =>
			{
				if (error) 
					reject(error);
				else 
				{
					console.log("connexion closed"); /*a supp*/
					resolve();
				}
			});
		});
	}

	execute(query: string, parameters: any[] = []): Promise <void>
	{
		return new Promise((resolve, reject) =>
		{
			if (!this._db)
				return reject(new Error("Database not connected"));
			this._db.run(query, parameters, (error)=>
			{
				if (error)
					reject(error);
				else
					resolve();
			});
		});
	}

	async query(query: string, parameters: any[] = []): Promise <any[]>
	{
		return new Promise((resolve, reject) =>
		{
			if (!this._db)
				return reject(new Error("Database not connected"));
			this._db.all(query, parameters,(error, rows: any[]) =>
			{
				if (error)
					reject(error);
				else
					resolve(rows);
			});
		});
	}

	/*TEST POUR DELETE UNE TABLE DE FACON GENERIQUE - A REVOIR ET SI OK SUPP DANS USER*/

	// async deleteUserTable(table: string, db: ManageDB) {
	// if (!/^[a-zA-Z0-9_]+$/.test(table)) {
	// 	throw new Error("Nom de table invalide");
	// }

	// const query = `DROP TABLE IF EXISTS ${table}`;
	// await db.execute(query);
// }

}

