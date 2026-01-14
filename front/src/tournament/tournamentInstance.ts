import { TournamentState } from "./tournamentNetwork";

export class TournamentInstance {
	private currentState: TournamentState = {
		status: "waiting",
		pseudo: { player1: "", player2: "", player3: "", player4: "" },
		finalists: { player1: "", player2: "" },
		champion: { player: "" }
	};

	applyServerState(state: Partial<TournamentState>) {
		this.currentState = { ...this.currentState, ...state };
	}

	getCurrentState() {
		return this.currentState;
	}

	setWinner(el: HTMLElement | null) {
		if (!el) return;
		el.classList.remove("border-neutral-600", "bg-neutral-900", "text-white", "border-neutral-700");
		el.classList.add("winner");
	}

	setLoser(el: HTMLElement | null) {
		if (!el) return;
		el.classList.remove("border-neutral-600", "bg-neutral-900", "text-white", "border-neutral-700");
		el.classList.add("loser");
	}
}
