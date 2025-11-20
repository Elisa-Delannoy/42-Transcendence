import { db } from "../../server";
import { users } from '../../server';
import bcrypt from "bcryptjs";

export async function manageRegister(pseudo: string, email: string, password: string): Promise<string> {
	try
	{
		await checkPseudo(pseudo);
		await checkPassword(password);
		await checkEmail(email);
	}
	catch (err)
	{
		return (err as Error).message;
	}
	const hashedPassword = await bcrypt.hash(password, 12);
	users.addUser(pseudo, email, hashedPassword);
	return "User have been register successfully";
}

async function checkPseudo(pseudo: string)
{
	const info = await users.getPseudoUser(pseudo);
	if (pseudo.length > 16)
		throw new Error("Pseudo too long! 16 character maximum.");
	if (info?.pseudo === pseudo)
		throw new Error("Pseudo already exists.");
}

async function checkEmail(email: string)
{
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		throw new Error("Invalid email format.");
	const info = await users.getEmailUser(email);
	if (info?.email === email)
		throw new Error("Email already in use.");
}

async function checkPassword(password: string)
{
	const set = new Set<string>();
    
	for (let i = 0; i < password.length; i++)
		set.add(password[i]);
	if (password.length < 6)
		throw new Error("Password must be at least 6 characters long.");
	if (password.length > 32)
		throw new Error("Password too long.");
	if (!/[a-zA-Z]/.test(password))
		throw new Error("Password must contain at least one letter.");
	if (!/\d/.test(password))
		throw new Error("Password must contain at least one number.");
	if (!/[!@#$%^&*()_\-+=.?]/.test(password))
    	throw new Error("Password must contain a special character.");
	if (/\s/.test(password))
    	throw new Error("Password cannot contain spaces.");
    if (set.size <= 3)
        throw new Error("Password must contain at least 4 different characters.");
    if (password.toLowerCase().includes("password"))
        throw new Error("Password cannot contain 'password'.");
}

