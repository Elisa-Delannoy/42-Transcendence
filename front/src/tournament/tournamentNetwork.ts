import { io, Socket } from "socket.io-client";

export class TournamentNetwork {
	private socket: Socket;
	private onStateCallback?: (idPlayers: number[]) => void;

	private onDisconnectionCallback?: () => void;

	constructor(serverUrl: string, tournamentId: number) {
		this.socket = io(serverUrl, { transports: ["websocket"] });

		this.socket.on("connect", () => {
			this.socket.emit("joinTournament", tournamentId);
		});

		this.socket.on("tournamentPlayersUpdate", (idPlayers: number[]) => {
			this.onStateCallback?.(idPlayers);
		});


		this.socket.on("disconnection", () => {
			this.onDisconnectionCallback?.();
		});
	}

	onState(cb: (idPlayers: number[]) => void) {
		this.onStateCallback = cb;
	}

	onDisconnection(cb: () => void) {
		this.onDisconnectionCallback = cb;
	}

	startGame() {
		this.socket.emit("startGame");
	}

	join(gameId: number, playerId: number) {
		this.socket.emit("joinTournament", gameId, playerId);
	}

	disconnect() {
		this.socket.emit("disconnection");
		this.socket.disconnect();
	}
}
