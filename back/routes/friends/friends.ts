import { db, friends, users } from '../../server';
import { IFriends, IMyFriend } from '../../DB/friend';
import { FastifyReply, FastifyRequest, FastifySerializerCompiler } from 'fastify';

export async function displayFriendPage(request: FastifyRequest, reply: FastifyReply): Promise< IMyFriend[] | undefined> 
{
	const infoFriends: IFriends[]= await friends.getMyFriends(request.user!.user_id);
	if (infoFriends.length === 0)
		return (reply.send(infoFriends), undefined);
	const allFriendID = friendsID(infoFriends, request.user!.user_id);
	const allMyFriends = await allMyFriendsInfo(allFriendID);
	// console.log("myfreind", allMyFriends);
	reply.send(allMyFriends);
	return  allMyFriends;
}


function friendsID(infoFriends: IFriends[], id: number): Partial<IMyFriend>[] {
	return infoFriends.map((findFriend) => { 
		const userID: number = findFriend.user_id1 === id ? findFriend.user_id2 : findFriend.user_id1;
		return {
			id: userID,
			friendship_date: findFriend.friendship_date,
			friendship_status: findFriend.status
		}
	});
}

async function allMyFriendsInfo(allMyFrd: Partial<IMyFriend>[]): Promise<IMyFriend[]> {
	const myFriendsinfo: IMyFriend[] = await Promise.all(
		allMyFrd.map(async (myfriend) => {
			const friend = await users.getIDUser(myfriend.id!);
			return ({
				id: myfriend.id!,
				avatar: `/api/private/avatar/${myfriend.id!}`,
				pseudo: friend.pseudo,
				webStatus: friend.status,
				friendship_date: myfriend.friendship_date!,
				friendship_status: myfriend.friendship_status!
			})
		})
	);
	return myFriendsinfo;
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
