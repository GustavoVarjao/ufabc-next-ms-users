import type { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify';
import type { Config } from '@/config/secret';

import { fastifyPlugin } from 'fastify-plugin';
import { fastifyJwt } from '@fastify/jwt';

export async function jwtAuth(app: FastifyInstance, opts: Config) {
  app.register(fastifyJwt, {
    secret: opts.JWT_SECRET,
  });

  app.decorate(
    'authenticate',
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        request.log.info({ user: request.user }, 'User authenticated');
        await request.jwtVerify();
        app.log.info('Jwt decorator added');
      } catch (error) {
        reply.log.error({ error }, 'error authenticating user');
        reply.send(error);
      }
    },
  );
}

export default fastifyPlugin(jwtAuth, {
  name: 'JsonWebToken',
});
