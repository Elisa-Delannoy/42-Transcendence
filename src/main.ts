import  { ManageDB } from './DB/manageDB';
import { Users } from './DB/users';


export const db = new ManageDB('./src//DB/database.db');

async function main()
{
    console.log('Attention debut du test');
    await db.connect()
    
    await Users.createUserTable(db);

    console.log('Table user ok');
    await db.close();


}

main()
    .then(()=> console.log("tout fini comme il faut"))
    .catch((error) => console.error("error:,", error));