import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import path, { join } from "path";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/register";
import { GameInfo } from "./DB/gameinfo";
import fastifyCookie from "@fastify/cookie";
import { checkAuth, tokenOK } from "./middleware/jwt";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import bcrypt from "bcryptjs";
import { createGame, joinGame, displayGameList, getGameType } from "./routes/game/serverGame";
import fs from "fs";
import { Tournament } from './DB/tournament';
import { uploadPendingTournaments } from "./routes/tournament/tournament.service";
import * as avalancheService from "./blockchain/avalanche.service";
import { Server } from "socket.io";
import multipart from "@fastify/multipart"
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always";
import * as tournamentService from "./routes/tournament/tournament.service";
import { getProfile } from "./routes/profile/profile";
import { getUpdateUsername, getUpdateEmail, getUploadAvatar, getUpdatePassword, getUpdateStatus, deleteUser } from "./routes/profile/getUpdate";
import { logout } from "./routes/logout/logout";
import { Friends } from "./DB/friend";
import { allMyFriendsAndOpponent, searchUser, addFriend, acceptFriend, deleteFriend } from "./routes/friends/friends";
import fastifyMetrics from "fastify-metrics";
import { dashboardInfo } from "./routes/dashboard/dashboard";
import { request } from "http";
import { navigateTo } from "../front/src/router";
import { checkTwoFA, disableTwoFA, enableTwoFA, setupTwoFA } from "./routes/twofa/twofa";
import { createTournament, createTournamentGame, displayTournamentList, getIdPlayers, getTournamentGameType, joinTournament, joinTournamentGame } from "./routes/tournament/serverTournament";

import { oauthStatus } from "./routes/login/oauth.status";
import { registerGoogle, callbackGoogle } from "./routes/login/oauth.google";
import { UpdatePasswordView } from "../front/src/views/p_updatepassword";
import { createWebSocket } from "./middleware/socket";
import { leaderboardInfo } from "./routes/leaderboard/leaderboard";
import { Chat } from "./DB/chat";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const friends = new Friends(db);
export const gameInfo = new GameInfo(db);
export const tournament = new Tournament(db);
export const generalChat = new Chat(db);

const fastify = Fastify({
	logger: false,
	https:
	{
		key: fs.readFileSync("server.key"),
		cert: fs.readFileSync("server.cert"),
	},
	trustProxy: true
});

fastify.register(fastifyMetrics, {
  endpoint: "/metrics",
  defaultMetrics: {
	enabled: true,
  }
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

fastify.register(async function (instance) {

  instance.register(fastifyStatic, {
    root: join(__dirname, "uploads"),
    prefix: "/files/",
    index: false,
  });
});

fastify.addHook("onRequest", async(request: FastifyRequest, reply: FastifyReply) => {
	// if (request.url.startsWith("/api/private")) {
	// 	// console.log("in on request")
	// 	const user = await tokenOK(request, reply);
	// 	// console.log("in on request ", user);
	// 	if (!user)
	// 		return reply.code(401).send({ error: "Unauthorized on request" });
	// 	request.user! = user;
	// }
	const user = await tokenOK(request, reply);
	request.user = user;
})


fastify.get("/api/checkLogin", async (request, reply) => {

	// const user = await tokenOK(request, reply);
	if (!request.user || request.user.user_id === null)
		return reply.send({ loggedIn: false, error: request.user?.error });
	reply.send({ loggedIn: true, user: {id: request.user.user_id, pseudo: request.user.pseudo, avatar: request.user.avatar, status: request.user.status, notif: globalThis.notif }});
});

fastify.get("/api/auth/status", async (request: FastifyRequest, reply: FastifyReply) => {
	return oauthStatus(request, reply);
});

fastify.get("/api/oauth/google", async (request: FastifyRequest, reply: FastifyReply) => {
	return await registerGoogle(request, reply);
});

fastify.get("/api/oauth/google/callback", async (request: FastifyRequest, reply: FastifyReply) => {
	return await callbackGoogle(request, reply);
});

fastify.post("/api/register", async (request, reply) => {
  const { username, email, password, confirm } = request.body as { username: string, password: string, email: string, confirm: string};
  await manageRegister(username, email, password, confirm, reply);
});

fastify.post("/api/login", async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password } = request.body as { username: string, password: string };
  await manageLogin(username, password, reply);
});

fastify.post("/api/private/2fa/setup", async (request: FastifyRequest, reply: FastifyReply) => {
    return await setupTwoFA(request, reply);
});

fastify.put("/api/private/2fa/enable", async (request: FastifyRequest, reply: FastifyReply) => {
	return await enableTwoFA(request, reply);
});

fastify.put("/api/private/2fa/disable", async (request: FastifyRequest, reply: FastifyReply) => {
	return await disableTwoFA(request, reply);
});

fastify.post("/api/private/profile", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getProfile(fastify, request, reply);
});

fastify.put("/api/private/updateinfo/status", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateStatus(request, reply);
});

fastify.put("/api/private/updateinfo/username", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateUsername(fastify, request, reply);
})

fastify.put("/api/private/updateinfo/email", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdateEmail(fastify, request, reply);
})

fastify.put("/api/private/updateinfo/password", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getUpdatePassword(fastify, request, reply);
})

fastify.post("/api/private/updateinfo/uploads", async (request, reply) => {
	await getUploadAvatar(request, reply);
});

fastify.delete("/api/private/updateinfo/delete", async (request, reply) => {
	await deleteUser(fastify, request, reply);
});

fastify.post("/api/private/friend", async (request: FastifyRequest, reply: FastifyReply) => {
	await allMyFriendsAndOpponent(request, reply);
})

fastify.post("/api/private/friend/add", async(request: FastifyRequest, reply: FastifyReply) => {
	await addFriend(request, reply);
})

fastify.post("/api/private/friend/accept", async(request: FastifyRequest, reply: FastifyReply) => {
	await acceptFriend(request, reply);
})

fastify.post("/api/private/friend/delete", async (request: FastifyRequest, reply: FastifyReply) => {
	await deleteFriend(request, reply)
})

fastify.post("/api/private/friend/search", async( request: FastifyRequest, reply: FastifyReply) => {
	await searchUser(request, reply);
})

fastify.post("/api/private/game/create", async (request, reply) => {
	const { localMode, type } = request.body as { localMode: boolean, type: "Local" | "AI" | "Online" | "Tournament" };
	const playerId = request.user?.user_id as any;
	const { vsAI } = request.body as { vsAI: boolean };
	let gameId: number;
	console.log(`vsAI is: ${vsAI}`);
	if (vsAI) {
		gameId = createGame(Number(playerId), localMode, type, { vsAI: true });
	} else {
		gameId = createGame(Number(playerId), localMode, type, { vsAI: false });
	}
	reply.send({ gameId });
});

fastify.post("/api/private/game/join", async (request, reply) => {
	const { gameId } = request.body as any;
	const playerId = request.user?.user_id as any;
	const id = Number(gameId);
	joinGame(playerId, id);
	reply.send({ message: "Player joined game" });
});

fastify.get("/api/private/game/list", async (request, reply) => {
	const list = await displayGameList();
	return { games: list };
});

fastify.post("/api/private/game/type", async (request, reply) => {
	const { gameId, tournamentId } = request.body as { gameId: number, tournamentId: number };
	let type;
	if (tournamentId)
		type = getTournamentGameType(Number(tournamentId), Number(gameId));
	else
		type = getGameType(Number(gameId));
	reply.send({ type });
});

fastify.post("/api/private/tournament/create", async (request, reply) => {
	const playerId = request.user?.user_id as any;
	let tournamentId: number;

	tournamentId = createTournament(playerId);
	reply.send({ tournamentId });
});

fastify.get("/api/private/tournament/list", async (request, reply) => {
	const list = await displayTournamentList();
	return { tournaments: list };
});

fastify.post("/api/private/tournament/join", async (request, reply) => {
	const { tournamentId } = request.body as any;
	const playerId = request.user?.user_id as any;
	const id = Number(tournamentId);
	joinTournament(playerId, id);
	reply.send({ message: "Player joined tournament" });
});

fastify.post("/api/private/tournament/add", (req, reply) => {
	return tournamentService.updateTournament(req, reply);
});

fastify.get("/api/private/tournament/all", (req, reply) => {
	return tournamentService.getAllTournamentsDetailed(req, reply);
});

fastify.get("/api/logout", async (request, reply) => {
	return await logout(request, reply);
})

const io = new Server(fastify.server, {
			cors: { origin: "*", credentials: true}
		});
createWebSocket(io);


fastify.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) => {
	return reply.sendFile("index.html");
})

fastify.get("/api/private/dashboard", async (request, reply) => {
	await dashboardInfo(request, reply);
});

fastify.get("/api/private/leaderboard", async (request, reply) => {
	await leaderboardInfo(reply);
});

fastify.post("/api/twofa", async (request, reply) => {
	const { code } = request.body as { code: number};
	await checkTwoFA(request, reply, code);
});

const start = async () => {
	const PORT = 3000
	try {
		globalThis.notif = false;
		await fastify.listen({ port: PORT, host: "0.0.0.0" });
		console.log(`Server running on port ${PORT}`);
		await db.connect();
		// await users.deleteUserTable();
		// await gameInfo.deleteGameInfoTable();
		// await friends.deleteFriendTable();
		await users.createUserTable();
		// await users.migrateUsersTable();
		
		await friends.createFriendTable();
		await gameInfo.createGameInfoTable();
		await tournament.createTournamentTable();
		await users.CreateUserIA();
		await users.CreateUserGuest();
		await generalChat.createChatTable();
		// const hashedPasswor= await bcrypt.hash("42", 12);
		// let hashedPassword = await bcrypt.hash("a", 12);
		const hashedPassword = await bcrypt.hash("42", 12);
		// users.addUser("a", "e@g.c", hashedPassword, 200);
		// users.addUser("new", "e@g.c", hashedPassword, 300);
		// users.addUser("ok", "e@g.c", hashedPassword, 500);
		// users.addUser("b", "e@g.c", hashedPassword, 700);
		// users.addUser("c", "e@g.c", hashedPassword, 1500);
		// users.addUser("d", "e@g.c", hashedPassword,2300);
		// users.addUser("42", "42", hashedPassword, 2800);
		// users.addUser("42", "42", hashedPassword);
		// friends.addFriendship(5, 6);
		// friends.addFriendship(4, 5);
	} catch (err) {
		console.log(err);
		fastify.log.error(err);
		process.exit(1);
	}
};

start();