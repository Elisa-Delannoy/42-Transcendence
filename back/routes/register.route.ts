import { FastifyInstance } from "fastify";
import { registerController } from "../controllers/register.controller";

export async function registerRoutes(fastify: FastifyInstance) {
	fastify.post("/register", async (request, reply) => {
		const { pseudo, email, password } = request.body as {
			pseudo: string;
			email: string;
			password: string;
		};

		const result = await registerController(pseudo, email, password);
		return reply.send({ message: result });
	});
}
