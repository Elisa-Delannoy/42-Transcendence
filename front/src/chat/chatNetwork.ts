import { io, Socket } from "socket.io-client";

export type dataChat = {
	pseudo: string,
	message : string, 
	date: string
}

export class chatNetwork {
	private socket: Socket;

	constructor() {
		const serverUrl = window.location.host;
		this.socket = io(serverUrl, {
			transports: ["websocket"],
			withCredentials: true,
		});
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
		this.socket.disconnect();
	}

	// requestHistory() {
	// 	this.socket.emit("requestHistory");
	// }

}