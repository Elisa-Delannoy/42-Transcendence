import { tournamentDB } from '../../server';
import * as avalancheService from "../../blockchain/avalanche.service";
import { FastifyRequest, FastifyReply } from "fastify";
import { serverTournament } from "./serverTournament";

export async function getAllTournamentsDetailed(
  request: FastifyRequest,
  reply: FastifyReply
) {
  request.log.info("GET /tournament/all called");

  try {
    const all = await tournamentDB.getAllTournaments();
    request.log.info({ count: all.length }, "Fetched tournaments");

    const result = await Promise.all(
      all.map(async (t: any) => {
        request.log.info({ tournamentId: t.id }, "Processing tournament");

        let ranking: number[] = [];
        try {
          const results = await tournamentDB.getTournamentResults(t.id);
          request.log.info({ tournamentId: t.id, results }, "DB results");

          ranking = results?.map(r => r.player_id ?? -1) ?? [];
        } catch (err) {
          request.log.error({ err, tournamentId: t.id }, "Failed DB ranking");
        }

        let blockchainRanking: number[] = [];
        const onChain = t.onchain === 1;

        if (onChain) {
          try {
            blockchainRanking = await avalancheService.getTournament(t.id);
            request.log.info(
              { tournamentId: t.id, blockchainRanking },
              "Fetched blockchain ranking"
            );
          } catch (err) {
            request.log.error(
              { err, tournamentId: t.id },
              "Blockchain fetch failed"
            );
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

    return reply.send(result);
  } catch (err) {
    request.log.error({ err }, "Fatal error in /tournament/all");
    return reply.send({ ok: false, error: "Internal server error" });
  }
}

export async function finalizeTournament(
  tournament: serverTournament
) {
  const ranking = [
    tournament.idFirst,
    tournament.idSecond,
    tournament.idThird,
    tournament.idFourth,
  ];

  if (ranking.some(id => id === undefined || id === null)) {
    throw new Error("Tournament ranking not fully initialized");
  }
  const tournamentId = await tournamentDB.createTournament();
  await tournamentDB.insertTournamentResults(tournamentId, ranking);
}

export async function uploadPendingTournaments() {
  const pending = await tournamentDB.getPendingOnChain();

  for (const t of pending) {
    const results = await tournamentDB.getTournamentResults(t.id);
    const ranking = results.map(r => r.player_id);

    while (ranking.length < 8) ranking.push(0);

    await avalancheService.addTournamentResult(t.id, ranking);
    await tournamentDB.markOnChain(t.id);
  }
}