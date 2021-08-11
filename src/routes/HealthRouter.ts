import {FastifyInstance} from 'fastify';
import * as os from 'os';
import {mem} from 'systeminformation';
import {mongoose, redis} from '../index';
import {formatBytes} from '../util/Util';

export default async function HealthRouter(router: FastifyInstance) {
  router.get('/', async (request, reply) => {
    const memory = await redis.info('memory');

    const memoryUsed = parseInt(
      memory.split(':')[1].split('used_memory_human')[0]
    );

    const memoryMachine = await mem();
    mongoose.connection.db.stats(async (error, result) => {
      reply.send({
        message: 'Is the backend up?',
        uptime: Math.floor(process.uptime()),
        redis: {
          status: redis.status,
          memoryUsed: formatBytes(memoryUsed),
        },
        mongo: {
          status: result.ok === 1 ? 'connected' : 'error',
          database: result.db,
          collections: result.collections,
          objects: result.objects,
          averageObjectSize: formatBytes(result.avgObjSize),
          dataSize: formatBytes(result.dataSize),
        },
        machine: {
          hostName: os.hostname(),
          cpus: os.cpus().length,
          memoryTotal: formatBytes(memoryMachine.total),
        },
      });
    });
  });
}
export const autoPrefix = '/health';
