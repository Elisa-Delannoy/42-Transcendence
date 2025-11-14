import { db, user } from "../../server";
import { Users } from '../../DB/users';
import { error } from "console";

export function manageRegister(username: string, email: string, password: string): string {
	try
	{
		checkUsername(username);
	}
	catch (err)
	{
		return (err as Error).message;
	}
	user.addUser(username, email, password);
	return "User have been register successfully";
}

function checkUsername(username: string)
{
	if (username.length < 12)
		throw new Error("Username too short ! lenght > 12.");
}

