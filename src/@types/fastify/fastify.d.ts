import type { Mongoose } from 'mongoose';
import { OAuth2Namespace } from '@fastify/oauth2';
declare module 'fastify' {
  export interface FastifyInstance {
    mongoose: Mongoose;
    FacebookOauth2Provider: OAuth2Namespace;
    GoogleOauth2Provider: OAuth2Namespace;
  }
}
