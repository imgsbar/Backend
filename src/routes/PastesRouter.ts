import {FastifyInstance} from 'fastify';
import {hash, verify} from 'argon2';
import {Paste} from '../documents/Pastes';
import {generateRandomString} from '../util/GenerationUtil';
import {authHandler} from '../handlers/AuthHandler';
import {pasteHandler} from '../handlers/PasteHandler';
import {
  createPastesInterface,
  viewPasteParams,
} from './../interfaces/PastesInterfaces';

export default async function PastesRouter(router: FastifyInstance) {
  router.post<{Body: createPastesInterface}>(
    '/create',
    {
      preHandler: authHandler,
      schema: {
        body: {
          type: 'object',
          required: ['content'],
          properties: {
            content: {type: 'string'},
            deleteOnView: {type: 'boolean'},
            expiresAt: {type: 'integer'},
            password: {type: 'string'},
          },
        },
      },
    },
    async (request, reply) => {
      const {content, deleteOnView, expiresAt, password} = request.body;
      const {user} = request;

      if (!user)
        return reply.status(500).send({message: "This shouldn't happen"});

      const paste = new Paste();
      paste._id = generateRandomString(18);
      paste.content = content;
      paste.password = password ? await hash(password) : null;
      paste.deleteOnView = deleteOnView || false;
      paste.disabled = false;
      paste.expiresAt = expiresAt || -1;
      paste.deletionKey = generateRandomString(24);
      paste.createdAt = new Date();
      paste.createdBy = user._id;

      await paste.save();

      return reply.send({
        pasteUrl: `https://betaapi.imgs.bar/v2/pastes/${paste._id}`,
        deletionUrl: `https://betaapi.imgs.bar/v2/pastes/delete/${paste.deletionKey}`,
      });
    }
  );

  router.get<{
    Params: viewPasteParams;
  }>('/:id', {preHandler: pasteHandler}, async (request, reply) => {
    const {paste} = request.params;

    if (paste.deleteOnView) {
      paste.disabled = true;
      await paste.save();
    }
    return reply.send(paste.content);
  });

  router.get(
    '/delete/:id',
    {preHandler: pasteHandler},
    async (request, reply) => {
      const {paste} = request.params;

      paste.disabled = true;
      await paste.save();

      reply.send(`Successfully deleted paste ${paste._id}`);
    }
  );
}

export const autoPrefix = '/paste';
