import {FastifyReply, FastifyRequest} from 'fastify';

export async function authHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {user} = request;
  if (!user) {
    return reply.status(401).send({message: 'Not logged in.'});
  }

  if (user.banned.status) {
    return reply.status(403).send({
      message: `You are banned with the reason: ${user.banned.reason}`,
    });
  }

  return;
}
