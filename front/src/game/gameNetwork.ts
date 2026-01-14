import { io, Socket } from "socket.io-client";

export interface GameState {
	ball: { x: number; y: number };
	paddles: { player1: number; player2: number };
	score: { player1: number; player2: number };
	status: "waiting" | "playing" | "finished" | "countdown" | "disconnected";
	pseudo: { player1: string; player2: string };
	type: "Local" | "AI" | "Online" | "Tournament";
}

export class GameNetwork {
	private socket: Socket;
	private onStateCallback?: (state: GameState) => void;

	private onPredrawCallback?: (state: GameState) => void;

	private onGameOverCallback?: () => void;

	private onCountdownCallback?: () => void;

	private onDisconnectionCallback?: () => void;

	private onRoleCallback?: (role: "player1" | "player2") => void;

	constructor() {
		const serverUrl = window.location.host;
		this.socket = io(serverUrl, {
			transports: ["websocket"],
			withCredentials: true,
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

		this.socket.on("disconnection", () => {
			this.onDisconnectionCallback?.();
		});

		this.socket.on("gameOver", () => {
			this.onGameOverCallback?.();
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

	onDisconnection(cb: () => void) {
		this.onDisconnectionCallback = cb;
	}

	startGame() {
		this.socket.emit("startGame");
	}

	sendInput(direction: "up" | "down" | "stop", player?: "player1" | "player2") {
		this.socket.emit("input", { direction, player });
	}

	join(gameId: number, tournamentId: number) {
		this.socket.emit("joinGame", gameId, tournamentId);
	}

	onGameOver(cb: () => void) {
		this.onGameOverCallback = cb;
	}

	disconnect() {
		this.socket?.disconnect();
	}
}
