import {hash} from 'argon2';
import Filter from 'bad-words';
import {FastifyInstance} from 'fastify';
import passport from 'fastify-passport';
import {v5} from 'uuid';
import {Invite} from '../../documents/Invite';
import {User} from '../../documents/User';
import {authInterfaces} from '../../interfaces/AuthInterfaces';
import {generateRandomString} from '../../util/GenerationUtil';
import {getFromRedis, setInRedis} from '../../util/RedisUtil';
import {hasTimeExpired} from '../../util/Util';
import {loginInterface} from './../../interfaces/AuthInterfaces';

const filter = new Filter();

async function getNextUid() {
  const uid = parseInt(await getFromRedis('uid', 1));
  await setInRedis('uid', uid + 1);
  return uid;
}

export default async function AuthRouter(router: FastifyInstance) {
  router.post<{Body: authInterfaces}>(
    '/register',
    {
      schema: {
        body: {
          type: 'object',
          required: ['email', 'password', 'username', 'invite'],
          properties: {
            email: {type: 'string', format: 'email'},
            password: {type: 'string', maxLength: 100, minLength: 6},
            username: {
              type: 'string',
              minLength: 3,
              maxLength: 12,
              pattern: '^[a-zA-Z0-9]*$',
            },
            invite: {type: 'string', minLength: 40, maxLength: 40},
          },
        },
      },
    },
    async (request, reply) => {
      if (request.user) {
        return reply.status(400).send({message: 'You are already logged in.'});
      }

      const {email, password, username, invite} = request.body;

      if (filter.isProfane(username)) {
        return reply.status(400).send({message: 'Profane username.'});
      }

      const emailUsed = await User.findOne({
        email: email.toLocaleLowerCase(),
      });

      if (emailUsed) {
        return reply.status(400).send({message: 'Email is already in use.'});
      }

      const usernameUsed = await User.findOne({
        username: {$regex: new RegExp(username, 'i')},
      });

      if (usernameUsed) {
        return reply.status(400).send({message: 'Username already in use.'});
      }

      const inviteFound = await Invite.findById(invite);
      if (
        !inviteFound ||
        !inviteFound.usable ||
        hasTimeExpired(inviteFound.expiresAt)
      ) {
        return reply.status(404).send({message: 'Invite not found.'});
      }

      const user = new User();
      user._id = v5(
        request.body.username,
        '03c35142-1374-47ae-9522-2c54395b57f4'
      );
      user.uid = await getNextUid();
      user.originalUid = user.uid;
      user.email = email.toLowerCase();
      user.username = username;
      user.password = await hash(password);
      user.registerDate = new Date();
      user.key = `${username}_${generateRandomString(50)}`;
      await user.save();

      await User.findByIdAndUpdate(inviteFound.createdBy, {
        $inc: {
          invited: 1,
        },
      });

      inviteFound.usages = inviteFound.usages + 1;
      inviteFound.usagesLeft = inviteFound.usagesLeft - 1;
      inviteFound.usable = inviteFound.usagesLeft > 1;
      inviteFound.usedBy = user._id;
      await inviteFound.save();

      return reply.send({message: 'Created account!'});
    }
  );

  router.post<{Body: loginInterface}>(
    '/login',
    {
      schema: {
        body: {
          type: 'object',
          required: ['username', 'password', 'rememberMe'],
          properties: {
            username: {
              type: 'string',
              minLength: 3,
            },
            password: {type: 'string', maxLength: 100, minLength: 6},
            rememberMe: {type: 'boolean'},
          },
        },
      },
      preValidation: passport.authenticate('local', {
        failWithError: true,
        authInfo: false,
      }),
    },
    async (request, reply) => {
      const {user} = request;
      const {rememberMe} = request.body;

      if (!user) {
        return reply.status(500).send({message: 'Internal server error.'});
      }

      if (user.banned.status) {
        return reply.status(403).send({
          message: `You are banned: ${
            user.banned.reason ? user.banned.reason : 'No reason'
          }`,
        });
      }

      if (rememberMe) {
        request.session.options({maxAge: 4 * 7 * 24 * 60 * 60});
      }
      return reply.send(user);
    }
  );

  router.get('/', async (request, reply) => {
    const {user} = request;
    if (user) {
      if (user.banned.status) {
        return reply.status(403).send({
          message: `You are banned: ${
            user.banned.reason ? user.banned.reason : 'No reason'
          }`,
        });
      }
      return reply.send({
        authorized: true,
        user,
      });
    }
    return reply.status(401).send({authorized: false});
  });

  router.get('/logout', async (request, reply) => {
    const {user} = request;

    if (!user) {
      return reply.status(401).send({message: 'You are not logged in.'});
    }

    request.logout();
    return reply.send({message: 'Logged you out.'});
  });
}
export const autoPrefix = '/auth';
