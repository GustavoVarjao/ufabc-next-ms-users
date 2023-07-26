import type { FastifyInstance } from 'fastify';
import { fastifyPlugin } from 'fastify-plugin';
import { fastifyOauth2 } from '@fastify/oauth2';
import {
  getFacebookUserDetails,
  getGoogleUserDetails,
} from './utils/get-oauth-info';
import { Config } from '@/config/secret';
import { UfabcNextOauth2Options } from './types/Oauth2Opts';

/* const sessionConfig = {
  secret: config.GRANT_SECRET,
  cookie: {
    secure: 'auto',
    maxAge: 604800000, // TTL (one week)
  },
} satisfies FastifySessionOptions; */

const providers: Providers = {
  google: {
    config: fastifyOauth2.GOOGLE_CONFIGURATION,
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: Config.OAUTH_GOOGLE_CLIENT_ID,
        secret: Config.OAUTH_GOOGLE_SECRET,
      },
    },
    getUserDetails: getGoogleUserDetails,
  },
  facebook: {
    config: fastifyOauth2.FACEBOOK_CONFIGURATION,
    credentials: {
      client: {
        id: Config.OAUTH_FACEBOOK_KEY,
        secret: Config.OAUTH_FACEBOOK_SECRET,
      },
    },
    scope: ['profile', 'email'],
    getUserDetails: getFacebookUserDetails,
  },
};

export async function oauth2(
  app: FastifyInstance,
  opts: UfabcNextOauth2Options,
) {
  const { provider } = opts;

  if (!providers[provider]) {
    throw new Error(`Unknown Provider ${provider}`);
  }
  const startRedirectPath = `/login/${provider}`;
  const callbackUri = `http://localhost:5000/login/${provider}/callback`;

    app.register(fastifyOauth2, {
      name: provider,
      credentials: {
        client: {
          id: providers[provider].credentials.client.id,
          secret: providers[provider].credentials.client.secret,
        },
        auth: providers[provider].config,
      },
      scope: providers[provider].scope,
      startRedirectPath,
      callbackUri,
    });

    app.get(`/login/${provider}/callback`, async function (request, reply) {
      try {
        // eslint-disable-next-line
        const { token } = await this[provider].getAccessTokenFromAuthorizationCodeFlow(request);

        const user = await providers[provider].getUserDetails(token);

        return reply.send({
          msg: 'cool',
          user,
        });
      } catch (error) {
        reply.log.error({ error }, 'Error in oauth2');
        return reply.send(error);
      }
    });
  }
}

export default fastifyPlugin(oauth2, {
  name: 'Oauth2',
});
