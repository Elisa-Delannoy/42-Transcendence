import { userInfo } from "os";
import { Server, Socket } from "socket.io";
import { generalChat } from "../server";

export async function handleGeneralChatSocket(io: Server, socket: Socket) {
	socket.emit("chatHistory", await generalChat.displayHistoryMessage());

	socket.join("general-chat");

	socket.on("generalChatMessage", async (message: string) => {
		try {

			if (typeof message !== "string")
				socket.emit("chatError", {error: "invalid message"});
			message = message.trim();
			if (message.length > 250)
				return socket.emit("chatError", {error: "message too long"});
			if (message.length === 0)
				return socket.emit("chatError", {error: "empty message"});
			const pseudo = socket.data.user.pseudo;
			const date = new Date().toISOString();
			await generalChat.addMessageChat(socket.data.user.id, pseudo, message, date)
			io.to("general-chat").emit("generalChatMessage", {
				pseudo: pseudo,
				message: message,
				date: date, 
			});
		} catch (err) {
	}
	})

	// socket.on("requestHistory", async () => {
    // const history = await generalChat.displayHistoryMessage();
    // socket.emit("chatHistory", history);
	// });

}

