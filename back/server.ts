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
import * as GameModule from "./DB/game";
import { collapseTextChangeRangesAcrossMultipleVersions } from "typescript";
import bcrypt from "bcryptjs";
import { createGame, endGame, updateGame } from "./routes/game/game";
import fs from "fs";
import FastifyHttpsAlwaysPlugin, { HttpsAlwaysOptions } from "fastify-https-always"

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const gameInfo = new GameInfo(db);

// const games = new Map<number, Game>();

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
  const { username, email, password } = request.body as any;
  return { message: await manageRegister(username, email, password) };
});

fastify.post("/api/login", async (request: FastifyRequest, reply: FastifyReply) => {
  const { username, password } = request.body as { username: string, password: string};
  await manageLogin(username, password, reply);
});

fastify.post("/api/private/homelogin", async (request: FastifyRequest, reply: FastifyReply) => {
	return { pseudo: request.user?.pseudo }
});

fastify.post("/api/private/profil", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const id = request.user?.user_id as any;
    const profil = await users.getIDUser(id);
    if (!profil)
    {
      return reply.code(404).send({message: "User not found"})
    }
    return profil;
  } catch (error) {
	fastify.log.error(error)
	return reply.code(500).send({message: "Internal Server Error"});
  }
});

fastify.post("/api/private/updateinfo", async (request: FastifyRequest, reply: FastifyReply) => {
  try {
    const id = request.user?.user_id as any;
    const profil = await users.getIDUser(id);
    if (!profil)
    {
      return reply.code(404).send({message: "User not found"})
    }
    return profil;
  } catch (error) {
    fastify.log.error(error)
    return reply.code(500).send({message: "Internal Server Error"});
  }
});

fastify.post("/api/private/changeusername", async (request, reply) => {
	try {
		const { newUsername, password } = request.body as any;
		const id = request.user?.user_id as any;

		const user = await users.getIDUser(id);
		if (!user)
			return reply.code(404).send({message: "User not found"});
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return reply.code(401).send({ message: "Wrong password" });
		}
		const updatedUser = await users.updateUsername(id, newUsername);
		return reply.code(200).send({ message: "Username updated", pseudo: updatedUser.pseudo });

	} catch (error) {
		fastify.log.error(error);
		return reply.code(500).send({ message: "Internal Server Error" });
	}
})

fastify.post("/api/private/game/create", async (request, reply) => {
	const gameId = createGame();

	reply.send({ gameId });
});

fastify.post("/api/private/game/update", async (request, reply) => {
	const { gameId, ballPos, paddlePos } = request.body as any;
	updateGame(gameId, ballPos, paddlePos );
	return { ok: true };
});

fastify.post("/api/private/game/end", async (request, reply) => {
	const { winner_id, loser_id, winner_score, loser_score, duration_game, id } = request.body as any;

	await endGame(winner_id, loser_id, winner_score, loser_score, duration_game, id, gameInfo);
	return { message: "Game saved!" };
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
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();