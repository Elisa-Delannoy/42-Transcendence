import Fastify from "fastify";
import fastifyStatic from "@fastify/static";
import { join } from "path";
import { request } from "http";

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

  console.log("Register data:", username, email, password);

  return { message: `Utilisateur ${username} enregistré avec succès !` };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000 });
    console.log("🚀 Serveur lancé sur http://localhost:3000");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
