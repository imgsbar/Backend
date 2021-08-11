import Filter from 'bad-words';
import {FastifyInstance} from 'fastify';
import {File} from '../../documents/File';
import {minio} from '../../config/config.json';
import {authHandler} from '../../handlers/AuthHandler';
import {botHandler} from '../../handlers/BotHandler';
import {getFromRedis, setInRedis} from '../../util/RedisUtil';
import {botInterface} from './../../interfaces/BotInterfaces';
import {setMotdInterface} from './../../interfaces/InformationInterfaces';

const filter = new Filter();

export default async function AuthRouter(router: FastifyInstance) {
  router.get('/motd', {preHandler: authHandler}, async (req, reply) => {
    const motd = await getFromRedis('motd', 'Message of the day');
    reply.send({motd});
  });

  router.get('/images', {preHandler: authHandler}, async (req, reply) => {
    const {user} = req;

    if (!user)
      return reply.status(500).send({message: "This shouldn't happen"});

    const fileInfo: {
      link: string;
      cdnLink: string;
      uploadedAt: Date;
      fileSize: number;
      originalFileName: string;
    }[] = [];

    const files = await File.find({'uploader.id': user._id});

    files.forEach(file => {
      if (file.deleted) return;
      fileInfo.push({
        link: `https://beta.aint.cool/${file.fileName}`,
        cdnLink: `https://${minio.endpoint}/imgs-beta/${file.cdnFileName}`,
        uploadedAt: file.uploadedAt,
        fileSize: file.size,
        originalFileName: file.originalFileName,
      });
    });

    return reply.send({files: fileInfo});
  });

  router.patch<{Body: setMotdInterface; Headers: botInterface}>(
    '/motd',
    {
      preHandler: botHandler,
      schema: {
        body: {
          type: 'object',
          required: ['motd'],
          properties: {motd: {type: 'string'}},
        },
      },
    },
    async (req, reply) => {
      const {motd} = req.body;

      await setInRedis('motd', motd);

      reply.send({motd: motd});
    }
  );
}
export const autoPrefix = '/information';
