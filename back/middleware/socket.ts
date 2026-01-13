import { Server, Socket } from "socket.io";
import { socketTokenOk, secretkey } from "./jwt";
import { IUsers } from "../DB/users";
import jwt from "jsonwebtoken";
import  * as cookie from "cookie";
import { handleGameSocket } from "../pong/pongServer";
import { handleTournamentSocket } from "../pong/tournamentServer";
import { tournaments_map } from "../routes/tournament/serverTournament";
import { handleGeneralChatSocket } from "../chat/chat";

export async function createWebSocket(io: Server) {
	io.use((socket, next) => {
  try {
	// 1. Récupérer le header cookie
	const cookieHeader = socket.request.headers.cookie;
	if (!cookieHeader) {
	  return next(new Error("No cookie"));
	}

	// 2. Parser les cookies
	const cookies = cookie.parse(cookieHeader);
	const token = cookies.token; // nom de ton cookie

	if (!token) {
	  return next(new Error("No token"));
	}

	// 3. Vérifier le JWT
	const user = jwt.verify(token, secretkey);

	// 4. Attacher le user au socket
	socket.data.user = user;
	console.log("id =", socket.data.user.id, " pseudo =", socket.data.user.pseudo, "avatar =", socket.data.user.avatar);

	next();
  } catch (err) {
	next(new Error("Unauthorized"));
  }
});


	io.on("connection", async (socket) => {
		handleGameSocket(io, socket);
		handleTournamentSocket(io, socket);
		handleGeneralChatSocket(io, socket);

		console.log(new Date().toISOString(),"dans creat", " ", " ", socket.id, socket.data.user);
	})
}