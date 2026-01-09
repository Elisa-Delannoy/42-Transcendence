import { FastifyReply, FastifyRequest } from "fastify";

export async function oauthStatus(request: FastifyRequest, reply: FastifyReply) {
    if (request.cookies.token)
      return reply.send({ ok: true, twofa: false });
    if (request.cookies.tempToken)
      return reply.send({ ok: true, twofa: true });
    return reply.status(401).send({ ok: false });
}
