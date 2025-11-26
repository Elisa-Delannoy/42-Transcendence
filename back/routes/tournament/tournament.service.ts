import { tournament } from '../../server';
import * as avalancheService from "../../blockchain/avalanche.service";

export async function uploadPendingTournaments() {
  //if (!tournament) throw new Error("Tournament not initialized");
  const pending = await tournament.getPendingOnChain();
  for (const t of pending) {
    const tournamentId = t.id;
    const ranking = [
      t.winner_id, t.second_place_id, t.third_place_id, t.fourth_place_id,
      t.fifth_place_id, t.sixth_place_id, t.seventh_place_id, t.eighth_place_id
    ];

    try {
      await avalancheService.addTournamentResult(tournamentId, ranking);
      await tournament.markOnChain(tournamentId);
      console.log(`Tournament ${tournamentId} uploaded and marked on-chain`);
    } catch (err) {
      console.error(`Failed to upload tournament ${tournamentId}:`, err);
    }
  }
}
