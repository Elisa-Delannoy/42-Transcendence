import { Server } from "socket.io";
import { secretkey } from "./jwt";
import jwt from "jsonwebtoken";
import  * as cookie from "cookie";
import { handleGameSocket } from "../pong/pongServer";
import { handleTournamentSocket } from "../pong/tournamentServer";
import { handleGeneralChatSocket } from "../chat/chat";
import { users } from "../server";

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
		socket.on("disconnect", async () => {
			await users.updateStatus(socket.data.user.id, "offline");
		});
	})
}
