import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";

import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { GameInfo } from "./DB/gameinfo";
import { initDB } from "./DB/initDB";

import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/resgister";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);
export const game = new GameInfo(db);

let login = ""

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: join(process.cwd(), "front"),
  prefix: "/",
});

// ===== Routes =====
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
	fastify.log.error(errorisLoggedIn())
	return reply.code(500).send({message: "Internal Server Error"});
	}
});

fastify.post("/api/game/end", async (request, reply) => {
  const { winner_id, loser_id, winner_score, loser_score, duration_game } = request.body as any;

  await game.addGameInfo(winner_id, loser_id, winner_score, loser_score, duration_game, "Bob");
  return { message: "Game saved!" };
})

// ===== Server Start =====
const start = async () => {
  try {
	await db.connect();
	await initDB(db);  // create all tables first

	await fastify.listen({ port: 3000 });

	console.log("🚀 Serveur lancé sur http://localhost:3000");
  } catch (err) {
	fastify.log.error(err);
	process.exit(1);
  }
};

start();