import { db, friends, users } from '../../server';
import { Friends, IMyFriends } from '../../DB/friend';
import { FastifyReply, FastifyRequest, FastifySerializerCompiler } from 'fastify';

export async function allMyFriends(request: FastifyRequest, reply: FastifyReply): Promise< IMyFriends[] | undefined> 
{
	const infoFriends: IMyFriends[]= await friends.getMyFriends(request.user!.user_id);
	if (infoFriends.length === 0)
		return (reply.send(infoFriends), undefined);


	// const allFriendID = friendsID(infoFriends, request.user!.user_id);
	// const allMyFriends = await allMyFriendsInfo(allFriendID);
	reply.send(infoFriends);
	return infoFriends;
}

// function friendsID(infoFriends: IFriends[], id: number): Partial<IMyFriends>[] {
// 	return infoFriends.map((findFriend) => { 
// 		const userID: number = findFriend.user_id1 === id ? findFriend.user_id2 : findFriend.user_id1;
// 		return {
// 			id: userID,
// 			friendship_date: findFriend.friendship_date,
// 			friendship_status: findFriend.status
// 		}
// 	});
// }

// async function allMyFriendsInfo(allMyFrd: Partial<IMyFriends>[]): Promise<IMyFriends[]> {
// 	const myFriendsinfo: IMyFriends[] = await Promise.all(
// 		allMyFrd.map(async (myfriend) => {
// 			const friend = await users.getIDUser(myfriend.id!);
// 			return ({
// 				id: myfriend.id!,
// 				avatar: friend.avatar,
// 				pseudo: friend.pseudo,
// 				webStatus: friend.status,
// 				friendship_date: myfriend.friendship_date!,
// 				friendship_status: myfriend.friendship_status!
// 			})
// 		})
// 	);
// 	return myFriendsinfo;
// }

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
		const { friendID } = request.body as { friendID: number }
	// const status = await friends.getFriendshipStatus(request.user!.user_id, friendID);
	// if (status)
	// 	return;
	await  friends.addFriendship(request.user!.user_id, friendID);
	
	reply.code(200).send({ message: "added" });
	}
	catch (err) {
		console.log(err);
	}
}

export async function acceptFriend(request: FastifyRequest, reply: FastifyReply) {
	try {
		const { friendID } = request.body as { friendID: number }
	// const status = await friends.getFriendshipStatus(request.user!.user_id, friendID);
	// if (status)
	// 	return;
	await friends.acceptFriendship(friendID, request.user!.user_id);
	reply.code(200).send({ message: "accepted" });

	}
	catch (err) {
		console.log(err);
	}
}

