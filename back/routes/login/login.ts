import { log } from "console";
import  { ManageDB } from "../../DB/manageDB";
import { Users } from '../../DB/users';
import { user } from '../../server';

export async function checkLogin(pseudo: string, password: string): Promise<boolean>
{
    const info = await user.getInfoUser(pseudo)
    if (!info || info.length === 0)
        return false;
    if (info.password === password)
        return true;
    return false;
}
