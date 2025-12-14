import { db, friends, users } from '../../server';
import { Friends, IMyFriends } from '../../DB/friend';
import { IUsers } from '../../DB/users'; 
import { FastifyReply, FastifyRequest, FastifySerializerCompiler } from 'fastify';
import { log } from 'console';

export async function allMyFriends(request: FastifyRequest, reply: FastifyReply): Promise< IMyFriends[] | undefined> 
{
	try {
		const infoFriends: IMyFriends[]= await friends.getMyFriends(request.user!.user_id);
		if (infoFriends.length === 0)
			return (reply.send(infoFriends), undefined);
		notification(infoFriends, request.user!.user_id);
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

export function notification(allFriends: IMyFriends[], id: number) {
	const printNotif = allFriends.filter(f => f.friendship_status === "pending" && f.asked_by != id);
		if (printNotif.length > 0)
			globalThis.notif = true;
		else
			globalThis.notif = false;
}

