import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/register";
import { GameInfo } from "./DB/gameinfo";
import fastifyCookie from "fastify-cookie";
import { tokenOK } from "./middleware/jwt";
import { CookieSerializeOptions } from "fastify-cookie";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import bcrypt from "bcryptjs";
import { createGame, endGame, updateGame, updateGameStatus } from "./routes/game/game";
import fs from "fs";
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always"
import { Tournament } from './DB/tournament';
import { uploadPendingTournaments } from "./routes/tournament/tournament.service";
import * as avalancheService from "./blockchain/avalanche.service";
import { getProfile } from "./routes/profile/profile";
import { getUpdateInfo, getUpdateUsername } from "./routes/profile/getUpdate";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const gameInfo = new GameInfo(db);
export const tournament = new Tournament(db);

// const games = new Map<number, Game>();

export const fastify = Fastify({
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

fastify.post("/api/register", async (request, reply) => {
  const { username, email, password } = request.body as { username: string, password: string, email: string};
  await manageRegister(username, email, password, reply);
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

fastify.post("/api/private/game/create", async (request, reply) => {
	const playerId = request.user?.user_id as any;
	const gameId = createGame(playerId);
	reply.send({ gameId });
});

fastify.post("/api/private/game/update", async (request, reply) => {
	const { gameId, ballPos, paddlePos } = request.body as any;
	updateGame(gameId, ballPos, paddlePos );
	return { ok: true };
});

fastify.post("/api/private/game/error", async (request, reply) => {
	const { id } = request.body as any;
	const gameid = Number(id);
	updateGameStatus(gameid, 2);
	return { message: "Game updated!" };
});

fastify.post("/api/private/game/end", async (request, reply) => {
	const { winner_id, loser_id, winner_score, loser_score, duration_game, id } = request.body as any;

	await endGame(winner_id, loser_id, winner_score, loser_score, duration_game, id, gameInfo);
	return { message: "Game saved!" };
});

fastify.post("/api/private/tournament/add", async (request, reply) => {
	try {
	  const { ranking } = request.body as any;
	  if (!Array.isArray(ranking) || ranking.length !== 8) {
		return reply.status(400).send({ error: "Ranking must be an array of 8 numbers" });
	  }
	  const id = await tournament.insertTournament(ranking);
	  try {
		await uploadPendingTournaments();
	  } catch (err) {
		console.error("Failed to upload tournaments on-chain:", err);
	  } 
	  return reply.send({
		message: "Tournament saved!",
		tournamentId: id
	  });
	} catch (err) {
	  console.error("Error saving tournament:", err);
	  return reply.status(500).send({ error: "Internal server error" });
	}
});

fastify.get("/api/private/tournament/all", async (_, reply) => {
	try {
	  const all = await tournament.getAllTournaments();  
	  const result = [];
  
	  for (const t of all) {
		const ranking = [
		  t.winner_id, t.second_place_id, t.third_place_id, t.fourth_place_id,
		  t.fifth_place_id, t.sixth_place_id, t.seventh_place_id, t.eighth_place_id
		];
		const onChain = t.onchain === 1;
		const blockchainRanking = onChain ? await avalancheService.getTournament(t.id) : null;
		result.push({
		  tournamentId: t.id,
		  ranking,
		  onChain,
		  blockchainRanking
		});
	  }
	  return reply.send(result);
	} catch (err) {
	  console.error("Error fetching tournaments:", err);
	  return reply.status(500).send({ error: "Internal server error" });
	}
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
	try {
		await fastify.listen({ port: 8443, host: "0.0.0.0" });
		await db.connect();
		// await users.deleteUserTable();
		await gameInfo.deleteGameInfoTable();
		await users.createUserTable();
		await gameInfo.createGameInfoTable();
		await tournament.createTournamentTable();
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();