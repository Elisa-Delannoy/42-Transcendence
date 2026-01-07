import { Server, Socket } from "socket.io";
import { socketTokenOk } from "./jwt";

export async function createWebSocket(io: Server, users: any) {
	io.on("connection", async(socket) => {
		const token = socket.handshake.auth.token;
		const user = await socketTokenOk(token);
		console.log(new Date().toISOString(),"dans creat", token, " ", user);
		if (!user)
			return socket.disconnect();
		socket.data.user = user;
		console.log("new user: ", user.pseudo, "users = ", users);
	})
}