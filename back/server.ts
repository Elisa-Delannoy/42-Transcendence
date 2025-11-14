import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import { request } from "http";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { GameInfo } from "./DB/gameinfo";

export const db = new ManageDB("./back/DB/database.db");

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

	const user = new Users(db, username, email, password);
	await user.addUser();

	return { message: `Utilisateur ${username} enregistré avec succès !` };
});

fastify.post("/api/gameinfo/add", async (request, reply) => {
	const { winner_id, loser_id, adversary_name} = request.body as any;

	const game = new GameInfo(db, winner_id, loser_id, adversary_name);
	await game.addGameInfo();
	return { message: "Game info added!" };
});

const start = async () => {
	try {
		await fastify.listen({ port: 3000 });
		await db.connect();
		// await Users.deleteUserTable(db);
		await Users.createUserTable(db);
		await GameInfo.createGameInfoTable(db);
		console.log("🚀 Serveur lancé sur http://localhost:3000");
	} catch (err) {
		fastify.log.error(err);
		process.exit(1);
	}
};

start();
