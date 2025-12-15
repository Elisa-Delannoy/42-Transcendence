import { io, Socket } from "socket.io-client";

export interface GameState {
	ball: { x: number; y: number };
	paddles: { player1: number; player2: number };
	score: { player1: number; player2: number };
	status: "waiting" | "playing" | "finished" | "countdown";
}

export class GameNetwork {
	private socket: Socket;
	private onStateCallback?: (state: GameState) => void;

	private onPredrawCallback?: (state: GameState) => void;

	private onGameOverCallback?: () => void;

	private onCountdownCallback?: () => void;

	private onRoleCallback?: (role: "player1" | "player2") => void;

	constructor(serverUrl: string, gameId: number) {
		this.socket = io(serverUrl, { transports: ["websocket"] });

		this.socket.on("connect", () => {
			this.socket.emit("joinGame", gameId);
		});

		this.socket.on("assignRole", (role: "player1" | "player2") => {
			this.onRoleCallback?.(role);
		})

		this.socket.on("state", (state: GameState) => {
			this.onStateCallback?.(state);
		});

		this.socket.on("predraw", (state: GameState) => {
			this.onPredrawCallback?.(state);
		});

		this.socket.on("startCountdown", () => {
			this.onCountdownCallback?.();
		});

		this.socket.on("gameOver", () => {
			this.onGameOverCallback?.();
			console.log("Game over, closing socket...");
			this.socket.close();
		});
	}

	onRole(cb: (role: "player1" | "player2") => void) {
		this.onRoleCallback = cb;
	}

	onCountdown(cb: () => void) {
		this.onCountdownCallback = cb;
	}

	onState(cb: (state: GameState) => void) {
		this.onStateCallback = cb;
	}

	onPredraw(cb: (state: GameState) => void) {
		this.onPredrawCallback = cb;
	}

	startGame() {
		this.socket.emit("startGame");
	}

	sendInput(direction: "up" | "down" | "stop", player?: "player1" | "player2") {
		this.socket.emit("input", { direction, player });
	}

	join(gameId: number) {
		this.socket.emit("joinGame", gameId);
	}

	onGameOver(cb: () => void) {
		this.onGameOverCallback = cb;
	}

	disconnect() {
		this.socket.disconnect();
	}
}
