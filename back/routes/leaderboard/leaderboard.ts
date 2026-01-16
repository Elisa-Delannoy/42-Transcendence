import { FastifyReply, FastifyRequest } from "fastify";
import { users } from "../../server";
import { IUsers } from "../../DB/users";

export type boardInfo = {
	pseudo: string,
	avatar: string
	elo: number
}

export interface ILeaderboard
{
	InfoUsers: boardInfo[]
	user: IUsers;
	user_position: number;
}

export async function leaderboardInfo(request: FastifyRequest,reply: FastifyReply) 
{
	const leaderboard: ILeaderboard = {} as ILeaderboard;
	leaderboard.InfoUsers = await users.GetLeaderboardInfo();
	if (request.user?.user_id)
	{
		leaderboard.user = await users.getIDUser(request.user?.user_id);
		leaderboard.user_position = await users.getPositionLeaderboard(request.user?.user_id);
	}
	reply.status(200).send(leaderboard);
}