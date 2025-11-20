import jwt from "jsonwebtoken";
import * as dotenv from "dotenv";
import { users } from "../server";
import { Users } from "../DB/users"
import { FastifyRequest, FastifyReply } from "fastify";

dotenv.config({ path: "./back/.env" });
const secretkey: string = process.env.SECRETKEY as string;
if (!secretkey)
	throw new Error("SECRETKEY is missing in .env");

export const createJWT = (id: number): string => {
	return jwt.sign({ id }, secretkey, { expiresIn: "1h", algorithm: "HS256" });
}

export const checkAuth = async (token: string): Promise< Users | null> => {
	try {
		const infoJWT = jwt.verify(token, secretkey) as { id : number };
		const user = await users.getIDUser(infoJWT.id);
		return user;
	} catch  (error) {
		console.error(error);
		return null;
	}
}

export const tokenOK = async (request: FastifyRequest, reply: FastifyReply): Promise< Users | null> => {
	const token = request.cookies.token;
	if (!token) {
		reply.code(401).send({ error: "Unauthorized: token is missing"});
		return null
	}
	const user_loged = await checkAuth(token);
	if (!user_loged) {
		reply.code(401).send({ error: "Unauthorized: invalid token or user"});
		return null
	}
	return user_loged;
}
