import { io, Socket } from "socket.io-client";

export interface ServerGameState {
	ball: { x: number; y: number };
	paddles: { player1: number; player2: number };
	score: { player1: number; player2: number };
}

export class GameNetwork {
	private socket: Socket;
	private onStateCallback?: (state: ServerGameState) => void;

/*
onStateCallback est une fonction que le front va définir pour savoir
quoi faire quand le serveur envoie un state.

La ligne this.onStateCallback?.(state) signifie :
“si quelqu’un a défini une fonction pour traiter le state,
appelle-la avec state comme argument”.

En gros, c’est un relais propre entre le socket et le front,
pour que le front n’ait jamais à manipuler le socket directement.
*/

	constructor(serverUrl: string, gameId: number) {
		this.socket = io(serverUrl, { transports: ["websocket"] });

		this.socket.on("connect", () => {
			this.socket.emit("joinGame", gameId);
		});

		this.socket.on("state", (state: ServerGameState) => {
			this.onStateCallback?.(state);
		});
	}

	onState(cb: (state: ServerGameState) => void) {
		this.onStateCallback = cb;
	}

	sendInput(direction: "up" | "down" | "stop") {
		this.socket.emit("input", { direction });
	}

	join(gameId: number) {
		this.socket.emit("joinGame", gameId);
	}

	disconnect() {
		this.socket.disconnect();
	}

	public getSocket(): Socket {
		return this.socket;
	}
}
