import { friends, gameInfo, users } from '../../server';
import { IMyFriends } from '../../DB/friend';
import { FastifyReply, FastifyRequest } from 'fastify';

export interface IFriendsAndNot {
	allMyFriends: IMyFriends[];
	playedWith: {id: number, pseudo: string, avatar: string}[];
}

export async function allMyFriendsAndOpponent(request: FastifyRequest, reply: FastifyReply): Promise <void>
{
	try {
		const allInfo: IFriendsAndNot = {} as IFriendsAndNot;
		if (request.user!.user_id !== null) {
			allInfo.allMyFriends = await friends.getMyFriends(request.user!.user_id);
			allInfo.playedWith = await gameInfo.getRecentPlayerNotFriend(request.user!.user_id);
			reply.send(allInfo);
			return;
		}		
	}
	catch (err) {
	}
}

export async function searchUser(request: FastifyRequest, reply: FastifyReply): Promise <void> {
	const { member } = request.body as { member: string };
	try {
		if (!member)
			return reply.code(400).send({ message: "Need pseudo to find members" });
		if (request.user!.user_id !== null) {
			const allMembers = await users.searchMember(member, request.user!.user_id);
			return reply.code(200).send(allMembers);
		}
	}
	catch (err)  {
		return reply.code(500).send({ error: err});
	}
}

export async function addFriend(request: FastifyRequest, reply: FastifyReply): Promise <void> {
	try {
		const { friendID } = request.body as { friendID: number };
		if (request.user!.user_id !== null) {
			const frd = await friends.isMyFriend(request.user!.user_id, friendID);
			if (!frd) {
				await  friends.addFriendship(request.user!.user_id, friendID);
				reply.code(200).send({ message: "added" });
			}
			reply.code(200).send({ message: "already in friendship" });
		}
	}
	catch (err) {
	}
}

export async function acceptFriend(request: FastifyRequest, reply: FastifyReply): Promise <void> {
	try {
		const { friendID } = request.body as { friendID: number };
		if (request.user!.user_id !== null) {
			await friends.acceptFriendship(friendID, request.user!.user_id);
			reply.code(200).send({ message: "accepted" });
		}
	}
	catch (err) {
	}
}

export async function deleteFriend(request: FastifyRequest, reply: FastifyReply): Promise <void> {
	try {
		const { friendID } = request.body as { friendID: number };
		if (request.user!.user_id !== null) {
			await friends.deleteFriendship(friendID, request.user!.user_id);
			reply.code(200).send({ message: "friendship deleted" });
		}
	}
	catch(err) {
	}
}

export async function notification(request: FastifyRequest, reply: FastifyReply): Promise<boolean> {
	try  {
		if (request.user!.user_id !== null) {
			const allFriends: IMyFriends[] = await friends.getMyFriends(request.user!.user_id);
			const printNotif = allFriends.filter(f => f.friendship_status === "pending" && f.asked_by != request.user!.user_id);
			if (printNotif.length > 0)
				return true;
			else
				return false;
		}
		return false;
	} catch(err) {
		return false;
	}
}
function isMyFriend() {
	throw new Error('Function not implemented.');
}

