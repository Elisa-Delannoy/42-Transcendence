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
	private onStartTournamentGameCallback?: () => void;

	constructor(serverUrl: string) {
		this.socket = io(serverUrl, { transports: ["websocket"] });

		this.socket.on("state", (state: TournamentState) => {
			this.onStateCallback?.(state);
		});

		this.socket.on("hostTournament", (playerId: number) => {
			this.onTournamentHostCallback?.(playerId);
		});

		this.socket.on("startTournamentGame", () => {
			this.onStartTournamentGameCallback?.();
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

	onStartTournamentGame(cb: () => void) {
		this.onStartTournamentGameCallback = cb;
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
