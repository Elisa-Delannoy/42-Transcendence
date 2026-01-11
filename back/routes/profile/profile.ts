import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { users } from '../../server';
// import path from "path";
// import fs from "fs";
// import mime from "mime-types";

export async function getProfile(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const id = request.user?.user_id as number;
		console.log("id)==== ", id);
		const profile = await users.getIDUser(id);
		if (!profile)
			return reply.code(404).send({message: "User not found"})
    	return profile;
  
	} catch (error) {
		fastify.log.error(error)
		return reply.code(500).send({message: "Internal Server Error"});
	}
}

