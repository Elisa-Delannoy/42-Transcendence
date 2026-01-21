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
	private onWaitForHostCallback?: () => void;
	private onDisconnectionCallback?: () => void;
	private onHostDisconnectedCallback?: () => void;
	private onsetUpSpecCallback?: () => void;
	private onStartTournamentGameCallback?: (gameId: number, tournamentId: number) => void;
	private onjoinTournamentGameCallback?: (gameId: number, loser: number) => void;
	private onKickCallback?: () => void;
	private onsetWinnerCallback?: (winner: number, tournamentId: number, status: "semifinal" | "final") => void;

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

		this.socket.on("waitForHost", () => {
			this.onWaitForHostCallback?.();
		});

		this.socket.on("startTournamentGame", (gameId: number, tournamentId: number) => {
			this.onStartTournamentGameCallback?.(gameId, tournamentId);
		});

		this.socket.on("joinTournamentGame", (gameId: number, tournamentId: number) => {
			this.onjoinTournamentGameCallback?.(gameId, tournamentId);
		});

		this.socket.on("setWinner", (winner: number, loser: number, status: "semifinal" | "final") => {
			this.onsetWinnerCallback?.(winner, loser, status);
		});

		this.socket.on("setupSpec", () => {
			this.onsetUpSpecCallback?.();
		});

		this.socket.on("hostDisconnected", () => {
			this.onHostDisconnectedCallback?.();
		});

		this.socket.on("kick", () => {
			this.onKickCallback?.();
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

	onWaitForHost(cb: () => void) {
		this.onWaitForHostCallback = cb;
	}

	onsetWinner(cb: (winner: number, loser: number, status: "semifinal" | "final") => void) {
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

	onKick(cb: () => void) {
		this.onKickCallback = cb;
	}

	onSetUpSpec(cb: () => void) {
		this.onsetUpSpecCallback = cb;
	}

	onStartTournamentGame(cb: (gameId: number, tournamentId: number) => void) {
		this.onStartTournamentGameCallback = cb;
	}

	onJoinTournamentGame(cb: (gameId: number, tournamentId: number) => void) {
		this.onjoinTournamentGameCallback = cb;
	}

	onHostDisconnected(cb: () => void) {
		this.onHostDisconnectedCallback = cb;
	}

	startTournament() {
		this.socket.emit("startTournament");
	}

	watchFinal() {
		this.socket.emit("watchGameTournament");
	}

	changeHost() {
		this.socket.emit("resetHost");
	}

	join(tournamentId: number) {
		this.socket.emit("joinTournament", tournamentId);
	}

	disconnect() {
		this.socket?.disconnect();
	}
}
