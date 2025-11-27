import { tournament } from '../../server';
import * as avalancheService from "../../blockchain/avalanche.service";
import { FastifyRequest, FastifyReply } from "fastify";

export async function uploadPendingTournaments(request: FastifyRequest) {
  const pending = await tournament.getPendingOnChain();
  for (const t of pending) {
    try {
      const ranking = [
        t.winner_id, t.second_place_id, t.third_place_id, t.fourth_place_id,
        t.fifth_place_id, t.sixth_place_id, t.seventh_place_id, t.eighth_place_id
      ];
      await avalancheService.addTournamentResult(t.id, ranking);
      await tournament.markOnChain(t.id);
      request.log.info(`Tournament ${t.id} uploaded on-chain`);
    } catch (err) {
      request.log.error({ err }, `Failed to upload tournament ${t.id}`);
    }
  }
}

export async function updateTournament(request: FastifyRequest,
  reply: FastifyReply) {
  try {
    const { ranking } = request.body as any;
    if (!Array.isArray(ranking) || ranking.length !== 8) {
      request.log.error({ ranking }, "Invalid ranking");
      return reply.status(400).send({ error: "Ranking must be an array of 8 numbers" });
    }
    const id = await tournament.insertTournament(ranking);
    try {
      await uploadPendingTournaments(request);
    } catch (err) {
      request.log.error({ err }, "Failed to upload tournaments to chain");
    }
    return reply.send({
      message: "Tournament saved!",
      tournamentId: id
    });
  } catch (err) {
    request.log.error({ err }, "Error saving tournament");
    return reply.status(500).send({ error: "Internal server error" });
  }
}

export async function getAllTournamentsDetailed(
  request: FastifyRequest,
  reply: FastifyReply
) {
  try {
    const all = await tournament.getAllTournaments();
    const result = await Promise.all(
      all.map(async (t: any) => {
        const ranking = [
          t.winner_id,
          t.second_place_id,
          t.third_place_id,
          t.fourth_place_id,
          t.fifth_place_id,
          t.sixth_place_id,
          t.seventh_place_id,
          t.eighth_place_id,
        ];

        const onChain = t.onchain === 1;

        let blockchainRanking: number[] | null = null;
        if (onChain) {
          try {
            blockchainRanking = await avalancheService.getTournament(t.id);
          } catch (err) {
            request.log.error({ err, tournamentId: t.id }, "Failed to fetch blockchain ranking");
          }
        }
        return {
          tournamentId: t.id,
          ranking,
          onChain,
          blockchainRanking,
        };
      })
    );
    return reply.status(200).send(result);
  } catch (err) {
    request.log.error({ err }, "Error fetching tournaments");
    return reply.status(500).send({ error: "Internal server error" });
  }
}
