import { io, Socket } from "socket.io-client";

export type dataChat = {
	pseudo: string,
	message : string, 
	date: string,
	me?: boolean
	id?: number | null,
}

export class chatNetwork {
	private socket: Socket;
	private socketUserID: number | null;

	constructor() {
	this.socket = null as any;
	this.socketUserID = null;
	}

	getsocketUserID() {
		return this.socketUserID;
	}

	connect(callback: () => void) {
		const serverUrl = window.location.host;
		this.socket = io(serverUrl, {
			transports: ["websocket"],
			withCredentials: true,
		});
		this.socket.once("connect", callback);
	}

	toKnowUserID() {
		this.socket.on("userID", (data) => {
			this.socketUserID = data.id;
		})
	}

	sendMessage(message: string) {
		this.socket.emit("generalChatMessage", message)
	}

	receiveMessage(callback: (data: dataChat ) => void) {
		this.socket.on("generalChatMessage", callback);
	}

	receiveHistory(callback: (messages: dataChat[]) => void) {
		this.socket.on("chatHistory", callback);
	}

	receiveError(callback: (data: { error: string }) => void) {
		this.socket.on("chatError", callback);
	}

	disconnect() {
		this.socket?.disconnect();
	}
}
