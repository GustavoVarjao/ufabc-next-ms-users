import type { FastifyInstance } from 'fastify';
import type { Config } from '@/config/secret';
import { fastifyPlugin } from 'fastify-plugin';
import { connect } from 'mongoose';

export async function mongoose(app: FastifyInstance, opts: Config) {
  const connection = await connect(opts.MONGODB_CONNECTION_URL);
  try {
    app.decorate('mongoose', connection);
    app.log.info(`Decorated the instance with mongoose`);
  } catch (error) {
    app.log.error({ error }, 'Error Connecting to mongodb');
    // Do not let the database connection hanging
    app.addHook('onClose', async () => {
      await connection.disconnect();
    });
  }
}

export default fastifyPlugin(mongoose, {
  name: 'Mongoose',
});
