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
	private onStartTournamentGameCallback?: (gameId: number) => void;
	private onjoinTournamentGameCallback?: (gameId: number) => void;

	constructor() {
		const { globalSocket } = require("../socket/socket");
		if (!globalSocket)
			throw new Error("globalSocket uninitialized");
		this.socket = globalSocket;


		this.socket.on("state", (state: TournamentState) => {
			this.onStateCallback?.(state);
		});

		this.socket.on("hostTournament", () => {
			this.onTournamentHostCallback?.();
		});

		this.socket.on("startTournamentGame", (gameId: number) => {
			this.onStartTournamentGameCallback?.(gameId);
		});

		this.socket.on("joinTournamentGame", (gameId: number) => {
			this.onjoinTournamentGameCallback?.(gameId);
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

	onDisconnection(cb: () => void) {
		this.onDisconnectionCallback = cb;
	}

	SetupSemiFinal() {
		this.socket.emit("setupSemiFinal");
	}

	SetupFinal() {
		this.socket.emit("setupFinal");
	}

	onStartTournamentGame(cb: (gameId: number) => void) {
		this.onStartTournamentGameCallback = cb;
	}

	onJoinTournamentGame(cb: (gameId: number) => void) {
		this.onjoinTournamentGameCallback = cb;
	}

	startTournament() {
		this.socket.emit("startTournament");
	}

	join(tournamentId: number) {
		this.socket.emit("joinTournament", tournamentId);
	}

	disconnect() {
		this.socket.emit("disconnection");
	}
}
