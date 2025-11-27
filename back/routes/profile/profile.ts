import { FastifyRequest, FastifyReply, FastifyInstance } from "fastify";
import { users } from '../../server';
import path from "path";
import fs from "fs";
import mime from "mime-types";

export async function getProfile(fastify: FastifyInstance, request: FastifyRequest, reply: FastifyReply) {
	try {
		const id = request.user?.user_id as number;
		const profile = await users.getIDUser(id);
		if (!profile)
			return reply.code(404).send({message: "User not found"})
    	return profile;
  
	} catch (error) {
		fastify.log.error(error)
		return reply.code(500).send({message: "Internal Server Error"});
 	}
}

export async function displayAvatar( request: FastifyRequest, reply: FastifyReply) {
	const avatar = request.user?.avatar;
	if (!avatar)
		return;
	const avatarPath = path.join(__dirname, "../../uploads", avatar);
	const type = mime.lookup(avatarPath);
	if (type !== "image/png" && type !== "image/jpeg")
		return;
	const stream = fs.createReadStream(avatarPath);
	return reply.type(type).send(stream);
}