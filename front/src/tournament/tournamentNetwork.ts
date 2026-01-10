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
	private onTournamentHostCallback?: (playerId: number) => void;
	private onDisconnectionCallback?: () => void;
	private onStartTournamentGameCallback?: (ennemyId: number, gameId: number) => void;
	private onjoinTournamentGameCallback?: (ennemyId: number, gameId: number) => void;

	constructor(serverUrl: string) {
		const { globalSocket } = require("../socket/socket");
		if (!globalSocket)
			throw new Error("globalSocket uninitialized");
		this.socket = globalSocket;


		this.socket.on("state", (state: TournamentState) => {
			this.onStateCallback?.(state);
		});

		this.socket.on("hostTournament", (playerId: number) => {
			this.onTournamentHostCallback?.(playerId);
		});

		this.socket.on("startTournamentGame", (ennemyId: number, gameId: number) => {
			this.onStartTournamentGameCallback?.(ennemyId, gameId);
		});

		this.socket.on("joinTournamentGame", (ennemyId: number, gameId: number) => {
			this.onjoinTournamentGameCallback?.(ennemyId, gameId);
		});

		this.socket.on("disconnection", () => {
			this.onDisconnectionCallback?.();
		});
	}

	onState(cb: (state: TournamentState) => void) {
		this.onStateCallback = cb;
	}

	onTournamentHost(cb: (playerId: number) => void) {
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

	onStartTournamentGame(cb: (ennemyId: number, gameId: number) => void) {
		this.onStartTournamentGameCallback = cb;
	}

	onJoinTournamentGame(cb: (ennemyId: number, gameId: number) => void) {
		this.onjoinTournamentGameCallback = cb;
	}

	startTournament() {
		this.socket.emit("startTournament");
	}

	join(gameId: number, playerId: number) {
		this.socket.emit("joinTournament", gameId, playerId);
	}

	disconnect() {
		this.socket.emit("disconnection");
		this.socket.disconnect();
	}
}
