import {FastifyReply, FastifyRequest} from 'fastify';
import {User} from '../documents/User';

export async function uploadHandler(
  request: FastifyRequest,
  reply: FastifyReply
) {
  if (!request.headers || !request.headers.key) {
    return reply.status(400).send({message: 'Provide a key to upload files'});
  }
  const key = request.headers.key as string;

  const user = await User.findOne({key});

  if (!user) {
    return reply.status(401).send({message: 'Invalid key.'});
  }

  if (user.banned.status) {
    return reply.status(403).send({
      message: `You are banned with the reason: ${user.banned.reason}`,
    });
  }

  request.user = user;

  return;
}
