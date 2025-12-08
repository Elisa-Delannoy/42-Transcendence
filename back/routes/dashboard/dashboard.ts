import { FastifyReply, FastifyRequest } from 'fastify';
import { gameInfo } from '../../server';
import { IGameInfo } from '../../DB/gameinfo';
import { getAvatarFromID } from '../avatar/avatar';
import { users } from '../../server';

export interface IDashBoard
{
	WinnerPseudo: string,
	WinnerPath: string,
	WinnerScore: number,
	LoserPseudo: string,
	LoserPath: string,
	LoserScore: number,
	DateGame: string,
	GameDuration: number
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
		const dashboard: IDashBoard[] = await Promise.all(
   		games.map(async (game: any) => 
		{
			let winnerpseudo;
			let loserpseudo;
			if (game.winner_id === null)
				winnerpseudo = await users.getIDUser(0);
			else
				winnerpseudo = await users.getIDUser(game.winner_id);
			if (game.loser_id === null)
				loserpseudo = await users.getIDUser(0);
			else
				loserpseudo = await users.getIDUser(game.loser_id);
			const winnerPath = await getAvatarFromID(winnerpseudo.user_id);
			const loserPath = await getAvatarFromID(loserpseudo.user_id);
			return {
				WinnerPseudo: winnerpseudo.pseudo,
				WinnerPath: winnerPath,
				WinnerScore: game.winner_score,
				LoserPseudo: loserpseudo.pseudo,
				LoserPath: loserPath,
				LoserScore: game.loser_score,
				DateGame: game.date_game,
				GameDuration: game.duration_game
				};
		}));

        reply.status(200).send(dashboard);
    }
    catch (err)
    {
        console.error(err);
        reply.status(500).send({ error: "Impossible de récupérer le dashboard" });
    }
}   