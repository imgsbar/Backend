import {promisify} from 'util';
import {redis} from '../index';

const getAsync = promisify(redis.get).bind(redis);

class CacheClass {
  ttl: number;

  constructor() {
    this.ttl = 300;
  }

  async get(name: string, defaultValue = false): Promise<any> {
    const val = await getAsync(name);
    if (!val) return defaultValue;
    return val;
  }

  async set(name: string, value: any) {
    await redis.set(name, value, 'EX', this.ttl);
  }

  async setNoExpire(name: string, value: any) {
    await redis.set(name, value);
  }
}

const Cache = new CacheClass();

export default Cache;
