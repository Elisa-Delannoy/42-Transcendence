import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import { request } from "http";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/resgister";
import { GameInfo } from "./DB/gameinfo";
import * as GameModule from "./DB/game";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const gameInfo = new GameInfo(db);

// const games = new Map<number, Game>();
let login = ""

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: join(process.cwd(), "front"),
  prefix: "/",
});

fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

fastify.post("/api/register", async (request, reply) => {
  const { username, email, password } = request.body as any;
  return { message: await manageRegister(username, email, password) };
});

fastify.post("/api/login", async (request, reply) => {
  const { username, password } = request.body as any;
  return { message: await manageLogin(username, password)};
});

fastify.get("/api/profil", async (request, reply) => {
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

fastify.post("/api/game/create", async (request, reply) => {
	const { adversary_name } = request.body as { adversary_name: string };

	const gameId = await gameInfo.createGame(adversary_name);

	const game = new GameModule.Game(gameId);
	GameModule.games.set(gameId, game);

	reply.send({ gameId });
});

fastify.post("/api/game/update", async (request, reply) => {
	const { gameId, ballPos, paddlePos } = request.body as {
		gameId: number;
		ballPos: { x: number, y: number };
		paddlePos: { player1: number, player2: number };
	};

	GameModule.updateGame(gameId, { ballPos, paddlePos });

	return { ok: true };
});

fastify.post("/api/game/end", async (request, reply) => {
	const { game_id, winner_id, loser_id, winner_score, loser_score, duration_game } = request.body as any;

	await gameInfo.finishGame(game_id, winner_id, loser_id, winner_score, loser_score, duration_game);
	return { message: "Game saved!" };
});

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