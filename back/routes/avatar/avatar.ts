import { FastifyReply, FastifyRequest } from 'fastify';
import { users, friends } from '../../server';
import { promises } from 'dns';
import { IFriends } from '../../DB/friend';
import path from "path";
import fs from "fs";
import mime from "mime-types";

// export async function getAvatarFromID(id: number): Promise<string>
// {
// 	const avatar: string = (await users.getIDUser(id)).avatar;
// 	const path: string = "/files/" + avatar;
// 	return path;
// }
