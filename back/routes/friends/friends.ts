import { db, friends, users } from '../../server';
import { Friends, IMyFriends } from '../../DB/friend';
import { FastifyReply, FastifyRequest, FastifySerializerCompiler } from 'fastify';
import { log } from 'console';

export async function allMyFriends(request: FastifyRequest, reply: FastifyReply): Promise< IMyFriends[] | undefined> 
{
	try {
		const infoFriends: IMyFriends[]= await friends.getMyFriends(request.user!.user_id);
		if (infoFriends.length === 0)
			return (reply.send(infoFriends), undefined);
		reply.send(infoFriends);
		return infoFriends;
	}
	catch (err) {
		console.log(err);
	}
}

export async function searchUser(request: FastifyRequest, reply: FastifyReply) {
	const { member } = request.body as { member: string };
	try {
		if (!member)
			return reply.code(400).send({ message: "Need pseudo to find members" });
		const allMembers = await users.searchMember(member, request.user!.user_id);
		return reply.code(200).send(allMembers);
	}
	catch (err)  {
		console.log(err);
		return reply.code(500).send({ error: err});
	}
}

export async function addFriend(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { friendID } = request.body as { friendID: number };
		await  friends.addFriendship(request.user!.user_id, friendID);
		reply.code(200).send({ message: "added" });
	}
	catch (err) {
		console.log(err);
	}
}

export async function acceptFriend(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { friendID } = request.body as { friendID: number };
	// const status = await friends.getFriendshipStatus(request.user!.user_id, friendID);
	// if (status)
	// 	return;
	await friends.acceptFriendship(friendID, request.user!.user_id);
	globalThis.notif = false;
	reply.code(200).send({ message: "accepted" });
	}
	catch (err) {
		console.log(err);
	}
}

export async function deleteFriend(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { friendID } = request.body as { friendID: number };
		await friends.deleteFriendship(friendID, request.user!.user_id);
		reply.code(200).send({ message: "friendship deleted" });
	}
	catch(err) {
		console.log(err);
	}
}


