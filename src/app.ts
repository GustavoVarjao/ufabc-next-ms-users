import { fastify, type FastifyServerOptions } from 'fastify';
import { fastifyAutoload } from '@fastify/autoload';
import { fastifyCors } from '@fastify/cors';
import { join } from 'node:path';
import { nextUsageRoute } from './modules/nextUsage';
import { healthCheckRoute } from './modules/healthCheck';
import { Config } from './config/secret';

export async function buildApp(opts: FastifyServerOptions = {}) {
  const app = fastify(opts);

  try {
    app.register(fastifyAutoload, {
      dir: join(__dirname, 'plugins'),
      dirNameRoutePrefix: false,
      options: Config,
    });
    app.register(fastifyCors, {
      origin: '*',
    });
    app.register(healthCheckRoute, { prefix: '/v2' });
    app.register(nextUsageRoute, { prefix: '/v2' });
  } catch (error) {
    app.log.fatal({ error }, 'setup app error');
    throw error;
  }

  return app;
}
