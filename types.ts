import fastify from "fastify"
import { UserJWT } from "./back/middleware/jwt";

declare module "fastify" {
	interface FastifyRequest {
		user?: UserJWT;
	}
}