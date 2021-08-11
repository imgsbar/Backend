import {FastifyInstance} from 'fastify';
import {User} from '../../documents/User';
import {configInterfaces} from '../../interfaces/ConfigInterfaces';

export default async function ConfigRouter(router: FastifyInstance) {
  router.get<{Querystring: configInterfaces}>(
    '/files',
    async (request, reply) => {
      const {key} = request.query;
      if (!key) {
        return reply.status(400).send({message: 'provide an api key!'});
      }

      const user = await User.findOne({key});
      if (!user) {
        return reply.status(400).send({message: 'invalid keeeeey'});
      }

      const config = {
        Name: `${user.username} on imgs.bar.sxcu`,
        DestinationType: 'ImageUploader, FileUploader',
        RequestType: 'POST',
        RequestURL: 'https://betaapi.imgs.bar/v2/upload/sharex',
        FileFormName: 'file',
        Body: 'MultipartFormData',
        Headers: {
          key,
        },
        URL: '$json:imageUrl$',
        DeletionURL: '$json:deletionUrl$',
        ErrorMessage: '$json:message$',
      };
      reply.header(
        'Content-Disposition',
        `attachment; filename=${user.username} on imgs.bar.sxcu`
      );
      return reply.send(Buffer.from(JSON.stringify(config, null, 2), 'utf8'));
    }
  );
}
export const autoPrefix = '/config';
