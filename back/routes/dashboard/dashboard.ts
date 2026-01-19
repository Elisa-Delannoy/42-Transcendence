import { FastifyReply, FastifyRequest } from 'fastify';
import { gameInfo } from '../../server';
import { IGameInfo } from '../../DB/gameinfo';
// import { getAvatarFromID } from '../avatar/avatar';
import { users } from '../../server';

export interface IDashBoard
{
	GamesInfo: IGameInfo[],
	WinLoose: {win:number, loose:number}
	TotalScore: {scored:number, taken:number}
	Elo: number;
	userId: number;
}

export async function dashboardInfo(request: FastifyRequest, reply: FastifyReply)
{
    const user_id = request.user?.user_id;
    if (!user_id) {
        return reply.status(400).send({ error: "Missing userId" });
    }
    try
    {
        const games = await gameInfo.getGamesByUser(user_id);
		const dashboard: IDashBoard = {} as IDashBoard;
		dashboard.GamesInfo = await Promise.all(
   		games.map(async (game: IGameInfo) => 
		{
			return {
				status: game.status,
				type: game.type,
   				winner_id: game.winner_id,
				winner_pseudo: game.winner_pseudo,
				winner_avatar: game.winner_avatar,
				loser_id: game.loser_id,
				loser_pseudo: game.loser_pseudo,
				loser_avatar: game.loser_avatar,
				date_game: game.date_game,
				duration_game: game.duration_game,
				winner_score: game.winner_score,
				loser_score: game.loser_score,
				winner_elo: game.winner_elo,
				loser_elo: game.loser_elo
				};
		}));
		dashboard.WinLoose = await gameInfo.getWinsLosses(user_id);
		dashboard.TotalScore = await gameInfo.getTotalScore(user_id);
		dashboard.Elo = await users.getEloFromID(user_id);
		dashboard.userId = user_id;
        reply.status(200).send(dashboard);
    }
    catch (err)
    {
        console.error(err);
        reply.status(500).send({ error: "Impossible de récupérer le dashboard" });
    }
}   