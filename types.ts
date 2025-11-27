import fastify from "fastify"
import { IUsers } from "./back/DB/users"

declare module "fastify" {
    interface FastifyRequest {
        user?: IUsers;
    }
}