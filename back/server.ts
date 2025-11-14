import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import { request } from "http";
import  { ManageDB } from "./DB/manageDB";
import { Users } from './DB/users';
import { checkLogin } from './routes/login/login';
import { manageRegister } from "./routes/register/resgister";

export const db = new ManageDB("./back/DB/database.db");
export const user = new Users(db);

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
  return { message: await manageRegister(username.tri, email, password) };
});

fastify.post("/api/login", async (request, reply) => {
  const { username, password } = request.body as any;
  const success = await checkLogin(username, password);
  if (success)
    return reply.code(200).send({message: `Welcome ${username} !` });
  else
    return reply.code(401).send({message: `Error login` });
});

const start = async () => {
  try {
	  await fastify.listen({ port: 3000 });
	  await db.connect();
    await Users.deleteUserTable(db);
    await Users.createUserTable(db);
    console.log("🚀 Serveur lancé sur http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
