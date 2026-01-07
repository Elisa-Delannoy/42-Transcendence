import { io, Socket } from "socket.io-client";

export interface TournamentState {
	status: "waiting" | "playing" | "finished";
	pseudo: { player1: string; player2: string; player3: string; player4: string };
}

export class TournamentNetwork {
	private socket: Socket;
	private onStateCallback?: (state: TournamentState) => void;
	private onCreatorCallback?: (playerId: number) => void;
	private onDisconnectionCallback?: () => void;

	constructor(serverUrl: string, tournamentId: number) {
		this.socket = io(serverUrl, { transports: ["websocket"] });

		this.socket.on("connect", () => {
			this.socket.emit("joinTournament", tournamentId);
		});

		this.socket.on("tournamentPlayersUpdate", (state: TournamentState) => {
			this.onStateCallback?.(state);
		});

		this.socket.on("isCreator", (playerId: number) => {
			this.onCreatorCallback?.(playerId);
		});

		this.socket.on("disconnection", () => {
			this.onDisconnectionCallback?.();
		});
	}

	onState(cb: (state: TournamentState) => void) {
		this.onStateCallback = cb;
	}

	onCreator(cb: (playerId: number) => void) {
		this.onCreatorCallback = cb;
	}

	onDisconnection(cb: () => void) {
		this.onDisconnectionCallback = cb;
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
