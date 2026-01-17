import { FastifyReply, FastifyRequest } from "fastify";
import { IAchievement } from "../../DB/achievements";
import { achievements } from "../../server";
import { REPLServer } from "repl";

export interface AchievementInfo
{
	unlocked: IAchievement[],
	locked: IAchievement[]
}

export async function getAchivementInfo(request: FastifyRequest, reply: FastifyReply)
{
	if (request.user!.user_id !== null)
	{
		const achievement = await achievements.getAchievementsStatus(request.user!.user_id);
		reply.status(200).send(achievement);
	}
}