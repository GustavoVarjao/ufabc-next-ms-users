import type { FastifyInstance } from 'fastify';
import type { Config } from '@/config/secret';
import { fastifyPlugin } from 'fastify-plugin';
import { fastifyOauth2 } from '@fastify/oauth2';
import {
  getFacebookUserDetails,
  getGoogleUserDetails,
} from './utils/get-oauth-info';
import { type Providers, objectKeys } from './types/Oauth2Opts';

// TODO: implement session token
export async function oauth2(app: FastifyInstance, opts: Config) {
  const providers = {
    google: {
      credentials: {
        client: {
          id: opts.OAUTH_GOOGLE_CLIENT_ID,
          secret: opts.OAUTH_GOOGLE_SECRET,
        },
      },
      config: fastifyOauth2.GOOGLE_CONFIGURATION,
      scope: ['profile', 'email'],
      getUserDetails: getGoogleUserDetails,
    },
    facebook: {
      credentials: {
        client: {
          id: opts.OAUTH_FACEBOOK_KEY,
          secret: opts.OAUTH_FACEBOOK_SECRET,
        },
      },
      config: fastifyOauth2.FACEBOOK_CONFIGURATION,
      scope: ['profile', 'email'],
      getUserDetails: getFacebookUserDetails,
    },
  } satisfies Providers;

  for (const provider of objectKeys(providers)) {
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
