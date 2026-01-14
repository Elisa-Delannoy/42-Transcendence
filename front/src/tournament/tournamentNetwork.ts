import { io, Socket } from "socket.io-client";

export interface TournamentState {
	status: "waiting" | "semifinal" | "final" | "finished";
	pseudo: { player1: string; player2: string; player3: string; player4: string };
	finalists: { player1: string; player2: string };
	champion: { player: string };
}

export class TournamentNetwork {
	private socket: Socket;
	private onStateCallback?: (state: TournamentState) => void;
	private onTournamentHostCallback?: () => void;
	private onDisconnectionCallback?: () => void;
	private onStartTournamentGameCallback?: (gameId: number, tournamentId: number) => void;
	private onjoinTournamentGameCallback?: (gameId: number, loser: number) => void;
	private onsetWinnerCallback?: (winner: number, tournamentId: number) => void;

	constructor() {
		const serverUrl = window.location.host;
		this.socket = io(serverUrl, {
			transports: ["websocket"],
			withCredentials: true,
		});;


		this.socket.on("state", (state: TournamentState) => {
			this.onStateCallback?.(state);
		});

		this.socket.on("hostTournament", () => {
			this.onTournamentHostCallback?.();
		});

		this.socket.on("startTournamentGame", (gameId: number, tournamentId: number) => {
			this.onStartTournamentGameCallback?.(gameId, tournamentId);
		});

		this.socket.on("joinTournamentGame", (gameId: number, tournamentId: number) => {
			this.onjoinTournamentGameCallback?.(gameId, tournamentId);
		});

		this.socket.on("setWinner", (winner: number, loser: number) => {
			this.onsetWinnerCallback?.(winner, loser);
		});

		this.socket.on("disconnection", () => {
			this.onDisconnectionCallback?.();
		});
	}

	onState(cb: (state: TournamentState) => void) {
		this.onStateCallback = cb;
	}

	onTournamentHost(cb: () => void) {
		this.onTournamentHostCallback = cb;
	}

	onsetWinner(cb: (winner: number, loser: number) => void) {
		this.onsetWinnerCallback = cb;
	}

	onDisconnection(cb: () => void) {
		this.onDisconnectionCallback = cb;
	}

	SetupSemiFinal() {
		this.socket.emit("setupSemiFinal");
	}

	SetupFinal() {
		this.socket.emit("setupFinal");
	}

	onStartTournamentGame(cb: (gameId: number, tournamentId: number) => void) {
		this.onStartTournamentGameCallback = cb;
	}

	onJoinTournamentGame(cb: (gameId: number, tournamentId: number) => void) {
		this.onjoinTournamentGameCallback = cb;
	}

	startTournament() {
		this.socket.emit("startTournament");
	}

	join(tournamentId: number) {
		this.socket.emit("joinTournament", tournamentId);
	}

	disconnect() {
		this.socket.disconnect();
	}
}
