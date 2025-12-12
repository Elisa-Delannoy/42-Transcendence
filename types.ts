import fastify from "fastify"
import { IUsers } from "./back/DB/users"
import { IMyFriends } from "./back/DB/friend"

declare module "fastify" {
    interface FastifyRequest {
        user?: IUsers;
        // myfriends?: IMyFriends[];
    }
}