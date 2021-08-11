import { FastifyReply, FastifyRequest } from 'fastify';
import config from '../config/config.json';
import { User } from '../documents/User';
import { botInterface, resolveUserInterface } from '../interfaces/BotInterfaces';

export async function botHandler(
  request: FastifyRequest<{ Headers: botInterface }>,
  reply: FastifyReply
) {
  const { key } = request.headers;

  if (!key || key !== config.authentication.bot) {
    return reply
      .status(401)
      .send({ message: 'This endpoint requires authentication.' });
  }

  return;
}

export async function ResolveUser(
  request: FastifyRequest<{ Body: resolveUserInterface }>,
  reply: FastifyReply
) {
  try {
    const UserIdentifier = request.body.user;

    let IdentifiedUser;

    if (parseInt(UserIdentifier) < 0 || parseInt(UserIdentifier) > 0) {
      IdentifiedUser = await User.findOne({
        $or:
          [
            { uid: parseInt(UserIdentifier) },
            { 'discord.id': UserIdentifier }
          ]
      });
    } else {
      IdentifiedUser = await User.findOne({
        $or:
          [
            { _id: UserIdentifier },
            { email: UserIdentifier },
            { username: new RegExp(`${UserIdentifier}`, 'i') }
          ]
      });
    }

    if (!IdentifiedUser) reply.status(403).send({ error: `Unknown User` })
    else if (IdentifiedUser?.banned.status) reply.status(403).send({ error: `You are banned with the reason: ${IdentifiedUser.banned.reason}` })
    else request.user = IdentifiedUser;
    return
  } catch (err) {
    reply.status(500).send({
      error: err.message
    })
  }
}
