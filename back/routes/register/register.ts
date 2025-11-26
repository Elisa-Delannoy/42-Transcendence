import { db } from "../../server";
import { users } from '../../server';
import bcrypt from "bcryptjs";
import { FastifyReply } from "fastify";

export async function manageRegister(pseudo: string, email: string, password: string, reply: FastifyReply)
{
	try
	{
		await checkPseudo(pseudo);
		await checkPassword(password);
		await checkEmail(email);
		const hashedPassword = await bcrypt.hash(password, 12);
		users.addUser(pseudo, email, hashedPassword);
		reply.status(200).send({ ok:true, message: "You have been register successfully."})
	}
	catch (err)
	{
		reply.status(401).send({ field: (err as any).field ?? null, ok:false, message: (err as Error).message });
	}
}

async function checkPseudo(pseudo: string)
{
	const info = await users.getPseudoUser(pseudo);
	if (pseudo.length > 16)
		throw { field: "username", message: "Pseudo too long! 16 character maximum." };
	if (info?.pseudo === pseudo)
		throw { field: "username", message: "Pseudo already exists." };
}

async function checkEmail(email: string)
{
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		throw { field: "email", message: "Invalid email format." };
	const info = await users.getEmailUser(email);
	if (info?.email === email)
		throw { field: "email", message: "Email already in use." };
}

async function checkPassword(password: string)
{
	const set = new Set<string>();
    
	for (let i = 0; i < password.length; i++)
		set.add(password[i]);
	if (password.length < 6)
		throw { field: "password", message: "Password must be at least 6 characters long." };
	if (password.length > 32)
		throw { field: "password", message: "Password too long." };
	if (!/[a-zA-Z]/.test(password))
		throw { field: "password", message: "Password must contain at least one letter." };
	if (!/\d/.test(password))
		throw { field: "password", message: "Password must contain at least one number." };
	if (!/[!@#$%^&*()_\-+=.?]/.test(password))
    	throw { field: "password", message: "Password must contain a special character." };
	if (/\s/.test(password))
    	throw { field: "password", message: "Password cannot contain spaces." };
    if (set.size <= 3)
        throw { field: "password", message: "Password must contain at least 4 different characters." };
    if (password.toLowerCase().includes("password"))
        throw { field: "password", message: "Password cannot contain 'password'." };
}
