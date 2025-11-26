import  { ManageDB } from "../../DB/manageDB";
import { Users } from '../../DB/users';
import { users } from '../../server';
import { createJWT} from "../../middleware/jwt";
import { CookieSerializeOptions } from "fastify-cookie";
import { FastifyReply } from "fastify";
import bcrypt from "bcryptjs";

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
		};
		reply.setCookie("token", jwtoken, options).status(200).send({ ok:true, message: "Login successful"})
	}
	catch (err)
	{
		reply.status(401).send({ field: (err as any).field ?? null, ok:false, error: (err as Error).message });
	}
}

async function checkLogin(pseudo: string, password: string)
{
	const info = await users.getPseudoUser(pseudo)
	if (!info || info.length === 0)
		throw { field: "username", message: "Invalid username." };
	const isMatch = await bcrypt.compare(password, info.password);
    if (!isMatch) {
        throw { field: "password", message: "Invalid password." };
    }
}
