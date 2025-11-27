import fastify from "fastify"
import { Users } from "./back/DB/users"

declare module "fastify" {
    interface FastifyRequest {
        user?: IUsers;
    }
}