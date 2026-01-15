import { userInfo } from "os";
import { Server, Socket } from "socket.io";
import { generalChat } from "../server";
import { dataChat } from "../../front/src/chat/chatNetwork";

export async function handleGeneralChatSocket(io: Server, socket: Socket) {
	const history = await generalChat.displayHistoryMessage();
	if (history) {
		const historyAndMe: dataChat[] = history.map((info: any) => ({
			...info,
			me: info.pseudo === socket.data.user.pseudo
  		}));
		socket.emit("chatHistory", historyAndMe);
	}
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
			await generalChat.addMessageChat(socket.data.user.id, pseudo, message, date);
			socket.emit("generalChatMessage", {
				pseudo,
				message,
				date,
				me: true
			});
			socket.to("general-chat").emit("generalChatMessage", {
				pseudo: pseudo,
				message: message,
				date: date,
				me: false
			});
		} catch (err) {
		}
	})
	socket.data.isitlogged = false;
}

// function 

