import { Server, Socket } from "socket.io";
import { socketTokenOk } from "./jwt";
import { IUsers } from "../DB/users";

export async function createWebSocket(io: Server) {
	io.on("connection", async (socket) => {
		const raw = socket.handshake.query.token;
		const token: string = Array.isArray(raw) ? raw[0] : raw ?? "";
		const user: IUsers | null = await socketTokenOk(token);
		if (!user)
			return socket.disconnect();
		socket.data.user = user.user_id;
		console.log(new Date().toISOString(),"dans creat", " ", " ", socket.id, socket.data.user);
	})
}