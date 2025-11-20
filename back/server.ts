import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/resgister";
import { GameInfo } from "./DB/gameinfo";
import fastifyCookie from "fastify-cookie";
import { tokenOK } from "./middleware/jwt";
import { CookieSerializeOptions } from "fastify-cookie";
import * as GameModule from "./DB/game";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const gameInfo = new GameInfo(db);

// const games = new Map<number, Game>();
let login = ""

const fastify = Fastify({
  logger: false,
});

fastify.register(fastifyStatic, {
  root: join(process.cwd(), "front"),
  prefix: "/",
});

fastify.register(fastifyCookie, {
  parseOptions: {}
})



fastify.addHook("onRequest", async(request: FastifyRequest, reply: FastifyReply) => {
	if (request.url.startsWith("/api/private")) {
		const user = await tokenOK(request, reply);
		if (user !== null)
			request.user = user;
	}
})

fastify.get("/api/isLoggedIn", async (request: FastifyRequest, reply: FastifyReply) => {
	const user = tokenOK(request, reply);
	if (user !== null)
		return { logged: true };
	return { logged: false };
})

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

fastify.get("/api/private/profil", async (request, reply) => {
	request.body 
	try {
	const profil = await users.getPseudoUser(login)
	if (!profil || profil === 0)
	{
	  return reply.code(404).send({message: "User not found"})
	}
	return profil;
	} catch (error) {
	fastify.log.error(error)
	return reply.code(500).send({message: "Internal Server Error"});
	}
});

fastify.post("/api/private/game/create", async (request, reply) => {
	const gameId = GameModule.games.size + 1;
	console.log("gameId : ", gameId, " type = ", typeof gameId);

	const game = new GameModule.Game(gameId);
	GameModule.games.set(gameId, game);

	reply.send({ gameId });
});

fastify.post("/api/private/game/update", async (request, reply) => {
	const { gameId, ballPos, paddlePos } = request.body as {
		gameId: number;
		ballPos: { x: number, y: number };
		paddlePos: { player1: number, player2: number };
	};

	GameModule.updateGame(gameId, { ballPos, paddlePos });

	return { ok: true };
});

fastify.post("/api/private/game/end", async (request, reply) => {
	const { winner_id, loser_id, winner_score, loser_score, duration_game, id } = request.body as any;

	const gameid = Number(id);
	const gameDate: any = GameModule.getDate(gameid);
	await gameInfo.finishGame(winner_id, loser_id, winner_score, loser_score, duration_game, gameDate);
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
		await fastify.listen({ port: 3000 });
		await db.connect();
		// await Users.deleteUserTable(db);
		await gameInfo.deleteGameInfoTable();
		await users.createUserTable();
		await gameInfo.createGameInfoTable();
		console.log("🚀 Serveur lancé sur http://localhost:3000");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();