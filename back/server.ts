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
import { CookieSerializeOptions } from "@fastify/cookie";
import multipart from "@fastify/multipart"

import { navigateTo } from "../front/src/router";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import bcrypt from "bcryptjs";
import { createGame, joinGame, endGame, updateGamePos, updateGameStatus, displayGameList } from "./routes/game/game";
import fs from "fs";
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always"
import { Tournament } from './DB/tournament';
import * as tournamentService from "./routes/tournament/tournament.service";
import * as avalancheService from "./blockchain/avalanche.service";
import { getProfile, displayAvatar } from "./routes/profile/profile";
import { getUpdateInfo, getUpdateUsername, getUpdateEmail, getUploadAvatar, getUpdatePassword } from "./routes/profile/getUpdate";


export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
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
  httpsPort:      8443
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
		fileSize: 2 * 1024 * 1024,
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

fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

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

fastify.post("/api/private/homelogin", async (request: FastifyRequest, reply: FastifyReply) => {
	return { pseudo: request.user?.pseudo }
});

fastify.post("/api/private/profile", async (request: FastifyRequest, reply: FastifyReply) => {
	return await getProfile(fastify, request, reply);
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
	return await getUploadAvatar(request, reply);
});

fastify.get("/api/private/avatar", async (request: FastifyRequest, reply: FastifyReply) => {
	return await displayAvatar(request, reply);
});

fastify.post("/api/private/game/create", async (request, reply) => {
	const playerId = request.user?.user_id as any;
	const gameId = createGame(playerId);
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
	const list = displayGameList();
	return { games: list };
})

fastify.post("/api/private/game/update/pos", async (request, reply) => {
	const { gameId, ballPos, paddlePos } = request.body as any;
	updateGamePos(gameId, ballPos, paddlePos );
	return { ok: true };
});

fastify.post("/api/private/game/update/status", async (request, reply) => {
	const { id, status } = request.body as any;
	const gameid = Number(id);
	updateGameStatus(gameid, status);
	return { message: "Game status updated!" };
});

fastify.post("/api/private/game/end", async (request, reply) => {
	const { winner_id, loser_id, winner_score, loser_score, duration_game, id } = request.body as any;

	await endGame(winner_id, loser_id, winner_score, loser_score, duration_game, id, gameInfo);
	return { message: "Game saved!" };
});


fastify.post("/api/private/tournament/add", (req, reply) => {
	return tournamentService.updateTournament(req, reply);
	});
	  
fastify.get("/api/private/tournament/all", (req, reply) => {
	return tournamentService.getAllTournamentsDetailed(req, reply);
});

fastify.get("/api/logout", async (request, reply) => {
	const options: CookieSerializeOptions = {
		httpOnly: true,
		secure: false, /*ATTENTION METTRE TRUE QUAND ON SERA EN HTTPS*/
		sameSite: "strict",
		path: "/",
	};
	reply.clearCookie("token", options);
	return { message: "is logged out" };
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
		await gameInfo.createGameInfoTable();
		await tournament.createTournamentTable();
		// const hashedPassword = await bcrypt.hash("42", 12);
		// users.addUser("42", "42", hashedPassword);
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();