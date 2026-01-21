import { FastifyReply, FastifyRequest } from "fastify";
import { IGameInfo } from "../../DB/gameinfo";
import { achievements, friends, gameInfo } from "../../server";
import { IAchievement } from "../../DB/achievements";


export interface IEndGame 
{
	type: "victory" | "defeat";
	gameinfo: IGameInfo;
	new_achievements: IAchievement[];
	friend: boolean;
}

export async function getEndGameInfo(request: FastifyRequest, reply: FastifyReply)
{
	try
	{
		const endgame : IEndGame = {} as IEndGame;
		const userId = request.user?.user_id
		if (!userId)
			reply.send({ ok: false, error: "Missing userId" });
		else
		{
			endgame.gameinfo = await gameInfo.getLastGame(userId)
			endgame.type = endgame.gameinfo.winner_id === userId ? "victory" : "defeat";
			endgame.new_achievements = await achievements.checkAchievementsForUser(userId);
			endgame.friend = await friends.isMyFriend(endgame.gameinfo.loser_id,endgame.gameinfo.winner_id);
		}
		reply.status(200).send(endgame);
	}
	catch(err)
	{
		console.log(err);
	}
}