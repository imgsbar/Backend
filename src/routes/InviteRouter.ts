import {FastifyInstance} from 'fastify';
import {Invite} from '../documents/Invite';
import {authHandler} from '../handlers/AuthHandler';
import {generateRandomString} from '../util/GenerationUtil';

export default async function InviteRouter(router: FastifyInstance) {
  router.addHook('preHandler', authHandler);

  router.post('/create', async (request, reply) => {
    const {user} = request;

    if (!user)
      return reply.status(500).send({message: "This shouldn't happen"});

    if (!user.roles.admin && user.invites < 1) {
      return reply
        .status(403)
        .send({message: "You don't have any invites left to create."});
    }

    const invite = new Invite();
    invite._id = await generateRandomString(40);
    invite.createdBy = user._id;
    await invite.save();

    if (!user.roles.admin) {
      user.invites = user.invites - 1;
    }
    await user.save();
    return reply.send({invite: invite._id});
  });
}

export async function checkInvites() {
  const invites = await Invite.find({
    expiresAt: {$ne: -1},
  });

  for (const invite of invites) {
    if (invite.expiresAt > new Date().getTime()) {
      await invite.delete();
    }
  }
}
export const autoPrefix = '/invites';
