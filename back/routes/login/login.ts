import  { ManageDB } from "../../DB/manageDB";
import { Users } from '../../DB/users';
import { users } from '../../server';
import { createJWT} from "../../middleware/jwt";
import { CookieSerializeOptions } from "fastify-cookie";
import { FastifyReply } from "fastify";

export async function manageLogin(pseudo: string, password: string, reply: FastifyReply)
{
	try 
	{
		await checkLogin(pseudo, password);
		const info = await users.getPseudoUser(pseudo);
		const jwtoken = createJWT(info.user_id);
		const options: CookieSerializeOptions = {
			httpOnly: true,
			secure: false, /*ATTENTION METTRE TRUE QUAND ON SERA EN HTTPS*/
			sameSite: "strict",
			path: "/",
			maxAge: 10
		};
		reply.setCookie("token", jwtoken, options).status(200).send({ message: "Login successful"})
	}
	catch (err)
	{
		reply.status(401).send({ message: (err as Error).message });
	}
}

async function checkLogin(pseudo: string, password: string)
{
	const info = await users.getPseudoUser(pseudo)
	if (!info || info.length === 0)
		throw new Error("Invalid Username.");
	if (info.password !== password)
		throw new Error("Invalid Password.");
}
