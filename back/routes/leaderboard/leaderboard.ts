import { FastifyReply } from "fastify";
import { users } from "../../server";

export type boardInfo = {
	pseudo: string,
	avatar: string
	elo: number
}

export interface ILeaderboard
{
	InfoUsers: boardInfo[];
}

export async function leaderboardInfo(reply: FastifyReply) 
{
	const leaderboard: ILeaderboard = {} as ILeaderboard;
	leaderboard.InfoUsers = await users.GetLeaderboardInfo();
	reply.status(200).send(leaderboard);
}