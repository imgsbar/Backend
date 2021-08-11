import {Domain} from './../documents/Domain';
import {Pastes} from './../documents/Pastes';
import {FastifyInstance} from 'fastify';
import {File} from '../documents/File';
import {User} from '../documents/User';
import {leaderBoardInterface} from '../interfaces/StatsInterfaces';
import Cache from '../util/CacheUtil';

export default async function StatsRouter(router: FastifyInstance) {
  router.get('/', async (request, reply) => {
    let users = parseInt(await Cache.get('cache.users'));
    let files = parseInt(await Cache.get('cache.files'));
    let domains = parseInt(await Cache.get('cache.domains'));
    let pastes = parseInt(await Cache.get('cache.pastes'));

    if (!users) {
      users = await User.estimatedDocumentCount().exec();
      await Cache.set('cache.users', users);
    }
    if (!files) {
      files = await File.estimatedDocumentCount().exec();
      await Cache.set('cache.files', files);
    }
    if (!domains) {
      domains = await Domain.estimatedDocumentCount().exec();
      await Cache.set('cache.domains', domains);
    }
    if (!pastes) {
      pastes = await Paste.estimatedDocumentCount().exec();
      await Cache.set('cache.pastes', pastes);
    }
    return reply.send({
      pastes,
      domains,
      users,
      files,
    });
  });

  router.get<{Params: leaderBoardInterface}>(
    '/leaderboards/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {id: {type: 'string', enum: ['uploads', 'invited']}},
        },
      },
    },
    async (request, reply) => {
      const {id} = request.params;

      let leaderBoard = await Cache.get(`leaderboard.${id}`);
      if (!leaderBoard) {
        leaderBoard = await User.find({})
          .sort({[id]: -1})
          .limit(10)
          .select(`${id} username _id `);

        await Cache.set(`leaderboard.${id}`, JSON.stringify(leaderBoard));
      }

      return reply.send(leaderBoard);
    }
  );
}
export const autoPrefix = '/stats';
