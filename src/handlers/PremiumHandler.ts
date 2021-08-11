import {FastifyReply, FastifyRequest} from 'fastify';

export async function premiumHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const {user} = request;
  if (!user) {
    return reply.status(401).send({message: 'Not logged in.'});
  }

  if (user.banned.status) {
    return reply.status(418).send({
      message: `ur banned, not teapot. reason: ${user.banned.reason}`,
    });
  }
  if (!user.roles.premium.status && !user.roles.premium) {
    return reply.status(403).send({
      message: 'This endpoint requires premium',
    });
  }

  return;
}
