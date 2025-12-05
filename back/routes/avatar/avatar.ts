import { FastifyReply, FastifyRequest } from 'fastify';
import { users } from '../../server';
import { promises } from 'dns';

export async function getAvatarFromID(id: number): Promise<string>
{
	const avatar: string = (await users.getIDUser(id)).avatar;
	const path: string = "/files/" + avatar;
	return path;
}