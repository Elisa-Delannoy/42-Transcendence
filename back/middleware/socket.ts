import { Server } from "socket.io";
import { secretkey } from "./jwt";
import jwt from "jsonwebtoken";
import  * as cookie from "cookie";
import { handleGameSocket } from "../pong/pongServer";
import { handleTournamentSocket } from "../pong/tournamentServer";
import { handleGeneralChatSocket } from "../chat/chat";
import { users } from "../server";

const userNbCon = new Map<number, number>();

export async function createWebSocket(io: Server) {
	io.use((socket, next) => {
		try {
			const cookieHeader = socket.request.headers.cookie;
			if (!cookieHeader) {
			  return next(new Error("No cookie"));
			}
			const cookies = cookie.parse(cookieHeader);
			const token = cookies.token;
			if (!token) {
			  return next(new Error("No token"));
			}
			const user = jwt.verify(token, secretkey);
			socket.data.user = user;
			next();
		} catch (err) {
			next(new Error("Unauthorized"));
		}
	});

	io.on("connection", async (socket) => {
		handleGameSocket(io, socket);
		handleTournamentSocket(io, socket);
		handleGeneralChatSocket(io, socket);

		let count = (userNbCon.get(socket.data.user.id) || 0) + 1;
		userNbCon.set(socket.data.user.id, count);
		socket.on("disconnect", async () => {
			count = (userNbCon.get(socket.data.user.id) || 1) - 1;
			if (count <= 0) { 
				userNbCon.delete(socket.data.user.id);
				await users.updateStatus(socket.data.user.id, "offline");
			} else {
				userNbCon.set(socket.data.user.id, count);
			};
		});
	});
}
