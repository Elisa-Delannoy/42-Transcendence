import { FastifyReply, FastifyRequest } from 'fastify';
import { users, friends } from '../../server';
import { promises } from 'dns';
import { IFriends } from '../../DB/friend';
import path from "path";
import fs from "fs";
import mime from "mime-types";

export async function getAvatarFromID(id: number): Promise<string>
{
	const avatar: string = (await users.getIDUser(id)).avatar;
	const path: string = "/files/" + avatar;
	return path;
}

export function buildAvatarPath(avatar: string) {
	const avatarPath = path.join(__dirname, "../../uploads", avatar);
	const type = mime.lookup(avatarPath) as string;
	return { type, path: avatarPath };
}

export async function displayAvatar( request: FastifyRequest, reply: FastifyReply) {
	const body = request.body as { memberID?: number } | undefined;
	const memberID = body?.memberID ?? request.user!.user_id;

	try {
		const avatar: string = (await users.getIDUser(memberID)).avatar;
		const { type, path } = buildAvatarPath(avatar);
		const stream = fs.createReadStream(path);
		return reply.type(type).send(stream);
	}
	catch (err) {
		console.log(err);
	}
}
