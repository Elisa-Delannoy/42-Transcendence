import { CookieSerializeOptions } from "@fastify/cookie";
import { FastifyReply, FastifyRequest } from "fastify";
import { users } from '../../server';


export async function logout(request: FastifyRequest, reply: FastifyReply) {
	const options: CookieSerializeOptions = {
			httpOnly: true,
			secure: true,
			sameSite: "strict",
			path: "/",
		};
		try {
			reply.clearCookie("token", options);
			if (request.user?.user_id)
				await users.updateStatus(request.user?.user_id, "offline");
			return { message: "is logged out" };
	}
		catch (err) {
		// console.log(err);
	}
};
