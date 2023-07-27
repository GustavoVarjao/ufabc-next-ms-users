import type { FastifyInstance } from 'fastify';
import type { Config } from '@/config/secret';
import { fastifyOauth2 } from '@fastify/oauth2';
import {
  getFacebookUserDetails,
  getGoogleUserDetails,
} from './utils/get-oauth-info';
import { type Providers, objectKeys } from './types/Oauth2Opts';
import { UserModel } from '@/model/User';

// TODO: implement session token
export default async function oauth2(app: FastifyInstance, opts: Config) {
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
      request.log.info({ params: request.params }, 'params query');
      try {
        // eslint-disable-next-line
        const { token } = await this[provider].getAccessTokenFromAuthorizationCodeFlow(request);
        // TODO: understand how to know what comes from here
        const oauthUser = await providers[provider].getUserDetails(token);
        const findUserQuery = [{ 'oauth.providerId': oauthUser.providerId }];
        let user = await UserModel.findOne({
          $or: findUserQuery,
        });
        // Might need to change the oauth schema for the new version
        if (user) {
          user.set({
            'oauth.providerId': oauthUser.providerId,
            'oauth.email': oauthUser.email,
            active: true,
          });
        } else {
          user = new UserModel({
            oauth: {
              email: oauthUser.email,
              providerId: oauthUser.providerId,
            },
          });
        }

        await user.save();
        const redirectTo =
          opts.NODE_ENV === 'dev'
            ? `${opts.WEB_URL}/login?token=${user.generateJWT()}`
            : `ufabcnext://login?token=${user.generateJWT()}`;
        console.log('mosra pra mim uma parada', redirectTo);
        return reply.redirect(200, redirectTo);
      } catch (error) {
        reply.log.error({ error }, 'Error in oauth2');
        return reply.send(error);
      }
    });
  }
}

export const autoPrefix = '/v2';
