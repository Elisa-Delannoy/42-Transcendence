import { TournamentState } from "./tournamentNetwork";

export class TournamentInstance {
	private currentState: TournamentState = {
		status: "waiting",
		pseudo: { player1: "", player2: "", player3: "", player4: "" }
	};

	applyServerState(state: Partial<TournamentState>) {
		this.currentState = { ...this.currentState, ...state };
	}

	getCurrentState() {
		return this.currentState;
	}
}
