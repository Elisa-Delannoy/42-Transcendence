import { execFileSync } from 'child_process';
import  { ManageDB } from './DB/manageDB';
import { Users } from './DB/users';

export const db = new ManageDB('./src//DB/database.db');

async function main()
{
	await db.connect();
	// await Users.deleteUserTable(db);
	await Users.createUserTable(db);

	// console.log('Table user ok');
	const user = new Users(db, "ely", "e@db.com", "psw10");
	await user.addUser();
	await db.close();
}

main()
	.then(()=> console.log("tout fini comme il faut"))
	.catch((error) => console.error("error:,", error));