import { Server, Socket } from "socket.io";
import { generalChat, users } from "../server";
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

	socket.emit("userID", {
		id: socket.data.user.id
	});

	await users.updateStatus(socket.data.user.id, "online");

	socket.join("general-chat");

	socket.on("generalChatMessage", async (message: string) => {
		try {
			if (typeof message !== "string")
				socket.emit("chatError", {error: "invalid message"});
			message = message.trim();
			if (message.length > 250)
				return socket.emit("chatError", {error: "message too long, max 250 characters"});
			if (message.length === 0)
				return socket.emit("chatError", {error: "empty message"});
			const pseudo = socket.data.user.pseudo;
			const date = new Date().toISOString();
			await generalChat.deletePreviosusMessage();
			await generalChat.addMessageChat(socket.data.user.id, pseudo, message, date);
			io.to("general-chat").emit("generalChatMessage", {
				pseudo: pseudo,
				message: message,
				date: date,
				id: socket.data.user.id
			});
		} catch (err) {
		}
	})
}
