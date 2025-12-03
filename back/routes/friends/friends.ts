import { friends, users } from '../../server';

export async function displayFriendPage(id:number): Promise<number[] | string> 
{
	const infoFriends = await friends.getMyFriends(id);
	const myFriends = infoFriends.map( findFriend  => 
		findFriend.user_id1 === id ? findFriend.user_id2 : findFriend.user_id1);
	console.log("myfreind", myFriends);
	return myFriends;
}
