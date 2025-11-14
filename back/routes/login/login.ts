import { log } from "console";
import  { ManageDB } from "../../DB/manageDB";
import { Users } from '../../DB/users';
import { user } from '../../server';

export async function manageLogin(pseudo: string, password: string): Promise<string>
{
    try 
    {
        checkLogin(pseudo, password);
    }
    catch (err)
    {
        return (err as Error).message;
    }
    return "Log in succesfully.";
}

async function checkLogin(pseudo: string, password: string)
{
    const info = await user.getInfoUser(pseudo)
    if (!info || info.length === 0)
        throw new Error("Invalid Username.");
    if (info.password ==! password)
        throw new Error("Invalid Password.");
}
