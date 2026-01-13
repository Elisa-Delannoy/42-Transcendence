import { io, Socket } from "socket.io-client";

export type dataChat = {
	pseudo: string,
	message : string, 
	date: string
}

export class chatNetwork {
	private socket: Socket;

	// constructor() {
	// 	const serverUrl = window.location.host;
	// 	this.socket = io(serverUrl, {
	// 		transports: ["websocket"],
	// 		withCredentials: true,
	// 	});
	// 	console.log("DANS CHATNETWORK");
	// 	// this.socket.on("connect", () => {
	// 	// 	this.requestHistory();
	// 	// });
	// }

	constructor() {
	this.socket = null as any;
}

	connect(callback: () => void) {
		const serverUrl = window.location.host;
		this.socket = io(serverUrl, {
			transports: ["websocket"],
			withCredentials: true,
		});
		if (this.socket.connected)
			callback();
		else
			this.socket.once("connect", callback);
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

	// requestHistory() {
	// 	this.socket.emit("requestHistory");
	// }

	receiveError(callback: (data: { error: string }) => void) {
		this.socket.on("chatError", callback);
	}

	disconnect() {
		this.socket.disconnect();
	}
}