import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { users } from "../server";
import { IUsers } from "../DB/users"
import { FastifyRequest, FastifyReply } from "fastify";

dotenv.config({ path: "./back/.env" });
const secretkey: string = process.env.SECRETKEY as string;
if (!secretkey)
	throw new Error("SECRETKEY is missing in .env");

export const createJWT = (id: number): string => {
	return jwt.sign({ id }, secretkey, { expiresIn: "1h", algorithm: "HS256" });
}

export const checkAuth = async (token: string, reply: FastifyReply): Promise< IUsers | Error> => {
	try {
		const infoJWT = jwt.verify(token, secretkey) as { id : number };
		const user = await users.getIDUser(infoJWT.id);
		return user;
	} catch  (error) {
		const err = error as Error;
		return err;
	}
}

export const tokenOK = async (request: FastifyRequest, reply: FastifyReply): Promise< IUsers | null> => {
	const token = request.cookies.token;
	if (!token) {
		reply.code(401).send({ error: "Unauthorized: token is missing"});
		return null
	}
	const user_loged = await checkAuth(token, reply);
	if (user_loged instanceof Error) {
		reply.code(401).send({ error: user_loged.name });
		return null
	}
	reply.code(200);
	return user_loged;
}
