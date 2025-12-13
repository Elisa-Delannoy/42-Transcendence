import  { ManageDB } from "../../DB/manageDB";
import { users } from '../../server';
import { createJWT} from "../../middleware/jwt";
import { CookieSerializeOptions } from "@fastify/cookie";
import { FastifyReply } from "fastify";
import bcrypt from "bcryptjs";
import speakeasy from "speakeasy";

export async function manageLogin(pseudo: string, password: string, code: string | undefined, reply: FastifyReply)
{
	try 
	{
		await checkLogin(pseudo, password);
		const info = await users.getPseudoUser(pseudo);
		if (info.twofa_enabled === 1) {
			if (!code) {
                return reply.send({ require2FA: true });
            }
            const verified = speakeasy.totp.verify({
                secret: info.twofa_secret,
                encoding: "base32",
                token: code,
                window: 1,
            });
            if (!verified) {
                return reply.status(401).send({
                    field: "2fa",
                    error: "Invalid 2FA code.",
                });
            }
		}
		const jwtoken = createJWT(info.user_id);
		const options: CookieSerializeOptions = {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
		};
		users.updateStatus(info.user_id, "online");
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
