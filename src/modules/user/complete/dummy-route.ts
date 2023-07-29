import type { FastifyPluginAsync } from 'fastify';
import { UserModel } from '@/model/User';
import { UfabcUser } from './user-complete.schema';

export const completeAccount: FastifyPluginAsync = async (app, opts) => {
  app.put('/users/complete', async (request, reply) => {
    try {
      const userDocument = new UserModel();
      const { email, ra } = UfabcUser.parse(request.body);
      request.log.info({ email, ra }, 'user complete data');

      userDocument.set({ email, ra });

      await userDocument.save();
      return reply.send(userDocument);
    } catch (error: unknown) {
      app.log.error({ error }, 'quebrou');
      throw error;
    }
  });
};
