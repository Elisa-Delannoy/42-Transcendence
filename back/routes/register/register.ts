import { db } from "../../server";
import { users } from '../../server';
import bcrypt from "bcryptjs";
import { FastifyReply } from "fastify";

export async function manageRegister(pseudo: string, email: string, password: string, confirm: string, reply: FastifyReply)
{
	email = email.toLowerCase();
	try
	{
		await checkPseudo(pseudo);
		await checkEmail(email);
		await checkPassword(password, confirm);
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
	if (pseudo.length > 16 || pseudo.length < 1)
		throw { field: "username", message: "Pseudo invalid! 1 character minimum and 16 character maximum." };
	if (info?.pseudo === pseudo)
		throw { field: "username", message: "Pseudo already exists." };
	const valid = /^[a-zA-Z0-9_]+$/.test(pseudo);
	if (!valid)
		throw { field: "username", message: "Pseudo can only contain letters, numbers and underscores." };
}

async function checkEmail(email: string)
{
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
		throw { field: "email", message: "Invalid email format." };
	const info = await users.getEmailUser(email);
	if (info?.email === email)
		throw { field: "email", message: "Email already in use." };
}

export const ALLOWED_SPECIALS = new Set([
  '!', '#', '$', '%', '&', '(', ')', '*', '+', '-', '.',
  '=', '?', '@', '\\', '^', '_',
]);

export async function checkPassword(password: string, confirm: string)
{
	const set = new Set<string>();
    
	let check: number = 0;

	if (password.length > 6 )
		check++;
	if (password.length < 32)
		check++;
	if (/[a-z]/.test(password))
		check++;
	if (/[A-Z]/.test(password))
		check++;
	if (/\d/.test(password))
		check++;
	if (/[!@#$%^&*()_\-+=.?]/.test(password))
    	check++;
	if (check !== 6)
		throw { field: "password", message: "The password does not meet the security requirements."};
    const forbiddenChars = [...password].filter(c => !ALLOWED_SPECIALS.has(c) && !/[a-zA-Z0-9]/.test(c));
	if (forbiddenChars.length > 0)
		throw { field: "password", message: "Your password contains invalid characters."};
	if (password !== confirm)
		throw { field: "confirm", message: "Password confirmation doesn't match."}
}

