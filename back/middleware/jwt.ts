import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { users } from "../server";
import { IUsers } from "../DB/users"
import { FastifyRequest, FastifyReply } from "fastify";
import { IsDeepStrictEqualOptions } from "util";
import { io } from "socket.io-client";

dotenv.config({ path: "./back/.env" });
export const secretkey: string = process.env.SECRETKEY as string;
const TEMP_JWT_SECRET = process.env.TEMP_JWT_SECRET!;

export type UserJWT = { 
	user_id: number;
    pseudo: string;
    avatar: string;
    status: string;
} | {
    user_id: null;
    error?: string;
}

if (!secretkey)
	throw new Error("SECRETKEY is missing in .env");

export const createJWT = (id: number, pseudo: string, avatar: string): string => {
	return jwt.sign({ id, pseudo, avatar}, secretkey, { expiresIn: "1h", algorithm: "HS256" });
}

export const checkAuth = async (token: string): Promise< IUsers | Error> => {
	try {
		const infoJWT = jwt.verify(token, secretkey) as { id : number };
		const user = await users.getIDUser(infoJWT.id);
		return user;
	} catch  (error) {
		const err = error as Error;
		if (err.name === "TokenExpiredError")
		{
			const id = jwt.decode(token) as { id : number }
			await users.updateStatus(id.id, "offline");
		}
		return err;
	}
}

export const tokenOK = async (request: FastifyRequest, reply: FastifyReply): Promise <UserJWT> => {
	const token = request.cookies.token;
	if (!token) {
		// reply.code(401).send({ error: "Unauthorized: token is missing"});
		return { user_id: null };
	}
	const user_loged = await checkAuth(token);
	if (user_loged instanceof Error) {
		// reply.code(401).send({ error: user_loged.name });
		return { user_id: null, error: user_loged.name };
	}
	//reply.code(200);
	console.log("user_loged ", user_loged);
	return { user_id: user_loged.user_id, pseudo: user_loged.pseudo, avatar: user_loged.avatar, status: user_loged.status };
}

export async function socketTokenOk(token: string): Promise <IUsers | null>{
	if (!token)
		return null;
	const user_logged = await checkAuth(token);
	if (user_logged instanceof Error)
		return null;
	return user_logged;
}

export function createTemp2FAToken( user_id: number)
{
  return jwt.sign(
    {
      id : user_id
    },
    TEMP_JWT_SECRET,
    {
      expiresIn: "5m"
    }
  );
}

export async function checkTempToken(request: FastifyRequest) : Promise<IUsers> 
{
	try 
	{
		const token: string = request.cookies.tempToken as string;
		if (!token) {
			throw { error : "Unauthorized: token is missing."};
		}
		const infoJWT = jwt.verify(token, TEMP_JWT_SECRET) as {id : number};
		const user = await users.getIDUser(infoJWT.id);
		return user;
	}
	catch (error)
	{
		throw { error : "Token Expired."};
	}
		
}
