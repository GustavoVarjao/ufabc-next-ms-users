import type { Mongoose } from 'mongoose';
import { OAuth2Namespace } from '@fastify/oauth2';
declare module 'fastify' {
  export interface FastifyInstance {
    mongoose: Mongoose;
    google: OAuth2Namespace;
    facebook: OAuth2Namespace;
  }
}
