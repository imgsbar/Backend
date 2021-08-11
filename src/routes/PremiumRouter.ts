import {FastifyInstance} from 'fastify';
import {User} from '../documents/User';
import {premiumHandler} from '../handlers/PremiumHandler';
import {sendPremiumExpire} from '../util/LogUtil';
import {msToTime} from '../util/Util';
import {setUidInterface} from './../interfaces/PremiumInterfaces';

export default async function PremiumRouter(router: FastifyInstance) {
  router.post<{Body: setUidInterface}>(
    '/setuid',
    {
      preHandler: premiumHandler,
      schema: {
        body: {
          type: 'object',
          required: ['uid'],
          properties: {uid: {type: 'integer', maximum: 0}},
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      const {uid} = request.body;

      if (!user)
        return reply.status(500).send({message: "This shouldn't happen"});

      const uidTaken = await User.findOne({uid});
      if (uidTaken) {
        return reply.send(400).send({message: 'UID already in use.'});
      }

      const now = new Date();

      if (user.cooldowns.lastUidChange) {
        const difference =
          now.getTime() - user.cooldowns.lastUidChange.getTime();

        if (difference < 86400000) {
          const timeLeft = msToTime(difference - 86400000);
          return reply.status(400).send({
            message: `You can change your uid in ${timeLeft}.`,
          });
        }
      }

      user.cooldowns.lastUidChange = now;

      user.uid = uid;
      await user.save();

      return reply.send({message: 'Updated UID successfully!'});
    }
  );
}

/**
 * Check all premium users, if their premium has expired.
 *
 * @export
 */
export async function checkPremium() {
  const premiumUsers = await User.find({'roles.premium.status': true});

  for (const user of premiumUsers) {
    if (
      user.roles.premium.endsAt <= new Date().getTime() &&
      user.roles.premium.endsAt !== -1
    ) {
      user.roles.premium.status = false;
      user.uid = user.originalUid;

      console.log(`${user.username}'s premium expired.`);
      await sendPremiumExpire(user).catch(err => console.log(err));

      await user.save();
    }
  }
}
export const autoPrefix = '/premium';
