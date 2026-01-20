import { FastifyReply, FastifyRequest } from "fastify";
import { users } from '../../server';
import bcrypt from "bcryptjs";

export async function oauthStatus(request: FastifyRequest, reply: FastifyReply) {
    if (request.cookies.token)
    {
      const id = request.user?.user_id as number;
      const profile = await users.getIDUser(id);
      if (!profile)
        return reply.code(404).send({message: "User not found"});
      const firstTimeLogin =  await bcrypt.compare("google", profile.password);
      return reply.send({ ok: true, twofa: false, firstTimeLogin});
    } 
    if (request.cookies.tempToken)
      return reply.send({ ok: true, twofa: true });
    return reply.status(401).send({ ok: false });
}
