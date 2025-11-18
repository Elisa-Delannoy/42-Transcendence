import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import { request } from "http";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { manageLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/resgister";
import { GameInfo } from "./DB/gameinfo";
import fastifyCookie from "fastify-cookie";

export const db = new ManageDB("./back/DB/database.db");
export const users = new Users(db);

let login = ""

const fastify = Fastify({
  logger: true,
});

fastify.register(fastifyStatic, {
  root: join(process.cwd(), "front"),
  prefix: "/",
});

fastify.register(fastifyCookie, {
  parseOptions: {}
})

fastify.get("/", async (request, reply) => {
  return reply.sendFile("index.html");
});

fastify.post("/api/register", async (request, reply) => {
  const { username, email, password } = request.body as any;
  return { message: await manageRegister(username, email, password) };
});

fastify.post("/api/gameinfo/add", async (request, reply) => {
	const { winner_id, loser_id, adversary_name} = request.body as any;

	const game = new GameInfo(db, winner_id, loser_id, adversary_name);
	await game.addGameInfo();
	return { message: "Game info added!" };
});

fastify.post("/api/login", async (request, reply) => {
  const { username, password } = request.body as any;
  await manageLogin(username, password, reply);
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

fastify.post("/api/game/end", async (request, reply) => {
  const { winner_id, loser_id, winner_score, loser_score } = request.body as any;

  const game = new GameInfo(db, winner_id, loser_id, "Bot");
  await game.updateScore(winner_score, loser_score);
  return { message: "Game saved!" };
})

const start = async () => {
  try {
	  await fastify.listen({ port: 3000 });
	  await db.connect();
    // await Users.deleteUserTable(db);
    await users.createUserTable();
	await GameInfo.createGameInfoTable(db);
    console.log("🚀 Serveur lancé sur http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();