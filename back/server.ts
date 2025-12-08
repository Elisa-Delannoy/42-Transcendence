import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/register";
import { GameInfo } from "./DB/gameinfo";
import fastifyCookie from "@fastify/cookie";
import { tokenOK } from "./middleware/jwt";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import bcrypt from "bcryptjs";
import { games_map, createGame, joinGame, getPlayersId, endGame, displayGameList, ServerGame } from "./routes/game/serverGame";
import fs from "fs";
import { Tournament } from './DB/tournament';
import { uploadPendingTournaments } from "./routes/tournament/tournament.service";
import * as avalancheService from "./blockchain/avalanche.service";
import { Server } from "socket.io";
import multipart from "@fastify/multipart"
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always";
import * as tournamentService from "./routes/tournament/tournament.service";
import { getProfile, displayAvatar } from "./routes/profile/profile";
import { getUpdateInfo, getUpdateUsername, getUpdateEmail, getUploadAvatar, getUpdatePassword, getUpdateStatus } from "./routes/profile/getUpdate";
import { logout } from "./routes/logout/logout";
import { request } from "http";
import { setupGameServer } from "./pong/pongServer";
import { Friends } from "./DB/friend";
import { displayFriendPage, displayFriendAvatar } from "./routes/friends/friends";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const friends = new Friends(db);
export const gameInfo = new GameInfo(db);
export const tournament = new Tournament(db);


const fastify = Fastify({
	logger: false,
	https:
	{
		key: fs.readFileSync("server.key"),
		cert: fs.readFileSync("server.cert"),
	},
	trustProxy: true
});

const httpsAlwaysOpts: HttpsAlwaysOptions = {
  productionOnly: false,
  redirect:       false,
  httpsPort:      3000
}

fastify.register(fastifyStatic, {
  root: join(process.cwd(), "front"),
  prefix: "/",
});

fastify.register(fastifyCookie, {
  parseOptions: {}
})

fastify.register(FastifyHttpsAlwaysPlugin, httpsAlwaysOpts)

fastify.register(multipart, {
	limits:{
		fileSize: 6 * 1024 * 1024,
		files: 1,
	}
})

fastify.addHook("onRequest", async(request: FastifyRequest, reply: FastifyReply) => {
	if (request.url.startsWith("/api/private")) {
		const user = await tokenOK(request, reply);
		if (user !== null)
			request.user = user;
	}
})

// fastify.get("/api/isLoggedIn", async (request: FastifyRequest, reply: FastifyReply) => {
// 	const user = await tokenOK(request, reply);
// 	if (user !== null)
// 		return { logged: true };
// 	return { logged: false };
// })

fastify.get("/api/checkLogin", async (request, reply) => {
	return tokenOK(request, reply);
});

fastify.post("/api/register", async (request, reply) => {
  const { username, email, password, confirm } = request.body as { username: string, password: string, email: string, confirm: string};
  await manageRegister(username, email, password, confirm, reply);
});

fastify.post("/api/login", async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password } = request.body as { username: string, password: string};
  await manageLogin(username, password, reply);
});

fastify.post("/api/private/getpseudo", async (request: FastifyRequest, reply: FastifyReply) => {
	return { pseudo: request.user?.pseudo }
});

fastify.post("/api/private/profile", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getProfile(fastify, request, reply);
});

fastify.post("/api/private/updateinfo/status", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateStatus(request, reply);
});

fastify.post("/api/private/updateinfo", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateInfo(fastify, request, reply);
});

fastify.post("/api/private/updateinfo/username", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateUsername(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/email", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateEmail(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/password", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdatePassword(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/uploads", async (request, reply) => {
	await getUploadAvatar(request, reply);
});

fastify.get("/api/private/avatar", async (request: FastifyRequest, reply: FastifyReply) => {
	await displayAvatar(request, reply);
});

fastify.post("/api/private/friend", async (request: FastifyRequest, reply: FastifyReply) => {
	const friends =  await displayFriendPage(request, reply);
	// if (friends !== null)
	// 	request.myfriends = friends;
	// return friends;
})


fastify.get("/api/private/avatar/:id", async (request: FastifyRequest, reply: FastifyReply) => {
	await displayFriendAvatar(request, reply);
});

fastify.post("/api/private/game/create", async (request, reply) => {
	const playerId = request.user?.user_id as any;
	const gameId = createGame(Number(playerId));
	reply.send({ gameId });
});

fastify.post("/api/private/game/join", async (request, reply) => {
	const { gameId } = request.body as any;
	const playerId = request.user?.user_id as any;
	const id = Number(gameId);
	joinGame(playerId, id);
	reply.send({ message: "Player joined game" });
});

fastify.post("/api/private/game/start", async (request, reply) => {
	const { gameId } = request.body as any;

	const playersId = getPlayersId(gameId);
	return { playersId };
});


fastify.get("/api/private/game/list", async (request, reply) => {
	const list = await displayGameList();
	return { games: list };
});

fastify.post("/api/private/tournament/add", (req, reply) => {
	return tournamentService.updateTournament(req, reply);
});

fastify.get("/api/private/tournament/all", (req, reply) => {
	return tournamentService.getAllTournamentsDetailed(req, reply);
});

fastify.get("/api/private/logout", async (request, reply) => {
	return await logout(request, reply);
})

const io = new Server(fastify.server, {
			cors: { origin: "*" }
		});
setupGameServer(io);

fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("index.html");
})


const start = async () => {
	const PORT = 3000
	try {
		await fastify.listen({ port: PORT, host: "0.0.0.0" });
		console.log(`Server running on port ${PORT}`);
		await db.connect();
		// await users.deleteUserTable();
		await gameInfo.deleteGameInfoTable();
		await users.createUserTable();
		await friends.createFriendsTable();
		await gameInfo.createGameInfoTable();
		await tournament.createTournamentTable();
		await users.CreateUserIA();
		// const hashedPassword = await bcrypt.hash("42", 12);
		// users.addUser("42", "42", hashedPassword);
		// friends.deleteFriendTable();
		// friends.addFriendship(7, 11);
		// friends.addFriendship(10, 7);
	} catch (err) {
		console.log(err);
		fastify.log.error(err);
		process.exit(1);
	}
};

start();