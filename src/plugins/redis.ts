import type { FastifyInstance } from 'fastify';
import type { Config } from '@/config/secret';
import { fastifyRedis } from '@fastify/redis';

export default async function redis(app: FastifyInstance, opts: Config) {
  try {
    app.register(fastifyRedis, {
      host: opts.HOST,
      password: opts.REDIS_PASSWORD,
      port: opts.REDIS_PORT,
      family: 4, // IPV4
    });
    app.log.info(`Decorated the instance with redis`);
  } catch (error) {
    app.log.error({ error }, 'Error Connecting to mongodb');
  }
}
