import {Domain} from './../../documents/Domain';
import {
  urlTypeBodyInterface,
  betaDomainEditInterface,
} from './../../interfaces/SettingsInterfaces';
import {
  domainRemoveInterface,
  domainSettingBodyInterface,
} from '../../interfaces/SettingsInterfaces';
import {FastifyInstance} from 'fastify';
import {authHandler} from '../../handlers/AuthHandler';
import {
  settingsBodyInterface,
  settingsParamsInterface,
  urlLengthBodyInterface,
} from '../../interfaces/SettingsInterfaces';
import {User} from '../../documents/User';

/**
 * Settings route for authenticated users
 *
 * @export
 * @param {FastifyInstance} router
 */
export default async function SettingsRouter(router: FastifyInstance) {
  router.addHook('preHandler', authHandler);

  router.get('/', async (request, reply) => {
    const {user} = request;
    return reply.send({settings: user!.settings});
  });

  router.patch<{Params: settingsParamsInterface; Body: settingsBodyInterface}>(
    '/update/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {
              type: 'string',
              enum: ['showExtension'],
            },
          },
        },
        body: {
          type: 'object',
          required: ['status'],
          properties: {status: {type: 'boolean'}},
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      const {status} = request.body;
      const {id} = request.params;

      await User.findByIdAndUpdate(user?._id, {
        [`settings.${id}`]: status,
      });
      return reply.send({
        message: 'Updated settings',
        settings: user?.settings,
      });
    }
  );

  router.patch<{Body: urlLengthBodyInterface}>(
    '/update/urlLength',
    {
      schema: {
        body: {
          type: 'object',
          required: ['status'],
          properties: {status: {type: 'number'}},
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      const {status} = request.body;

      //We have to do this
      if (!status) {
        await User.findByIdAndUpdate(user?._id, {
          'settings.urlLength': 0,
        });
      }

      await User.findByIdAndUpdate(user?._id, {
        'settings.urlLength': status,
      });
      return reply.send({
        message: 'Updated url length.',
        settings: user?.settings,
      });
    }
  );

  router.patch<{Body: urlTypeBodyInterface}>(
    '/update/urlType',
    {
      schema: {
        body: {
          type: 'object',
          required: ['type'],
          properties: {
            status: {type: 'string', enum: ['normal', 'emoji', 'invisible']},
          },
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      const {type} = request.body;

      await User.findByIdAndUpdate(user?._id, {
        'settings.urlType': type,
      });
      return reply.send({
        message: 'Updated url type.',
        settings: user?.settings,
      });
    }
  );

  router.patch<{Body: settingsBodyInterface}>(
    '/update/embed',
    {
      schema: {
        body: {
          type: 'object',
          required: ['status'],
          properties: {status: {type: 'boolean'}},
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      const {status} = request.body;

      await User.findByIdAndUpdate(user?._id, {
        'settings.embeds.enabled': status,
      });
      return reply.send({
        message: 'Updated longURL',
        settings: user?.settings,
      });
    }
  );

  router.put<{Body: domainSettingBodyInterface}>(
    '/update/domains',
    {
      schema: {
        body: {
          type: 'object',
          required: ['name', 'subDomain', 'fake', 'embeds', 'fileNamePrefix'],
          properties: {
            name: {type: 'string'},
            subDomain: {type: 'string'},
            fake: {type: 'boolean'},
            embeds: {type: 'array'},
            fileNamePrefix: {type: 'string'},
          },
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      const {name, subDomain, fake, embeds, fileNamePrefix} = request.body;

      user?.settings.domains.push({
        name,
        subDomain,
        fake,
        embeds,
        fileNamePrefix,
      });
      await user?.save();

      return reply.send({
        message: 'Added domain',
        settings: user?.settings,
      });
    }
  );

  router.delete<{Params: domainRemoveInterface}>(
    '/update/domains/:id',
    {
      schema: {
        params: {
          type: 'object',
          required: ['id'],
          properties: {
            id: {type: 'string'},
          },
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      if (!user) {
        return reply.send({message: 'Unauthorized'});
      }

      const {id} = request.params;

      user.settings.domains = user.settings.domains.filter(
        domain => !domain.name.includes(id)
      );

      await user?.save();

      return reply.send({
        message: 'Removed domain',
        settings: user?.settings,
      });
    }
  );

  //TODO: recode this to support multiple embed profiles
  //Really bad way of doing this, but we really wanted to change domains soo....
  router.patch<{Body: betaDomainEditInterface}>(
    '/beta/domain',
    {
      schema: {
        body: {
          type: 'object',
          required: ['domain', 'fileNamePrefix'],
          properties: {domain: {type: 'string', fileNamePrefix: 'string'}},
        },
      },
    },
    async (request, reply) => {
      const {user} = request;
      const {domain, fileNamePrefix} = request.body;

      const domainCheck = await Domain.findOne({domain});
      if (!domainCheck || !user) {
        return reply.status(400).send({message: 'Domain not found'});
      }

      // This is why we only support one embed profile, so TODO
      user.settings.domains[0] = {
        ...user.settings.domains[0],
        embeds: user.settings.domains[0].embeds,
        name: domain,
        fileNamePrefix,
      };

      await user.save();

      return reply.send({
        message: 'Updated domain and shit',
        settings: user?.settings,
      });
    }
  );
}
export const autoPrefix = '/settings';
