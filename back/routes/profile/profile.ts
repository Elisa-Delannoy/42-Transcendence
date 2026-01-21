import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { users } from '../../server';
// import path from "path";
// import fs from "fs";
// import mime from "mime-types";

export async function getProfile(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const id = request.user?.user_id as number;
		const profile = await users.getIDUser(id);
		if (!profile)
			return reply.send({ ok: false, message: "User not found"})
    	return profile;
  
	} catch (error) {
		fastify.log.error(error)
		return reply.send({ ok: false, message: "Internal Server Error"});
	}
}

