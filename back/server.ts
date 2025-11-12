import Fastify from "fastify";

const fastify = Fastify({
  logger: true,
});

fastify.get("/", async (request, reply) => {
  return  `
    <h1>Bienvenue 👋</h1>
    <p>C'est la page d'accueil.</p>
  `;
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
