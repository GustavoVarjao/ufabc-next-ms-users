import type { FastifyInstance } from 'fastify';
import type { Config } from '@/config/secret';
import { fastifyPlugin } from 'fastify-plugin';
import { FastifyOAuth2Options, fastifyOauth2 } from '@fastify/oauth2';
import { getGoogleUserDetails } from './utils/get-oauth-info';
import { UserModel } from '@/model/User';

/* const sessionConfig = {
  secret: config.GRANT_SECRET,
  cookie: {
    secure: 'auto',
    maxAge: 604800000, // TTL (one week)
  },
} satisfies FastifySessionOptions; */

export async function oauth2(app: FastifyInstance, opts: Config) {
  const facebookOauth2config = {
    name: 'FacebookOauth2Provider',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: opts.OAUTH_FACEBOOK_KEY,
        secret: opts.OAUTH_FACEBOOK_SECRET,
      },
      auth: fastifyOauth2.FACEBOOK_CONFIGURATION,
    },
    startRedirectPath: '/login/facebook',
    callbackUri: 'http://localhost:5000/oauth/facebook',
  } satisfies FastifyOAuth2Options;

  const googleOauth2config = {
    name: 'GoogleOauth2Provider',
    scope: ['profile', 'email'],
    credentials: {
      client: {
        id: opts.OAUTH_GOOGLE_CLIENT_ID,
        secret: opts.OAUTH_GOOGLE_SECRET,
      },
      auth: fastifyOauth2.GOOGLE_CONFIGURATION,
    },
    startRedirectPath: '/login/google',
    callbackUri: 'http://localhost:5000/login/google/callback',
  } satisfies FastifyOAuth2Options;

  app.register(fastifyOauth2, googleOauth2config);
  app.register(fastifyOauth2, facebookOauth2config);

  app.get('/login/google/callback', async function (request, reply) {
    try {
      const { token } =
        await this.GoogleOauth2Provider.getAccessTokenFromAuthorizationCodeFlow(
          request,
        );

      const googleUser = await getGoogleUserDetails(token);

      reply.status(200).send(googleUser);
    } catch (error) {
      reply.log.error({ error }, 'Error in oauth2');
      return reply.send(error);
    }
  });

  app.get('/oauth/facebook', async function (request, reply) {
    try {
      const { token } =
        await this.FacebookOauth2Provider.getAccessTokenFromAuthorizationCodeFlow(
          request,
        );

      const facebookUserInfo = await getOauthInfo(
        `https://graph.facebook.com/me?fields=id,name,email,picture.width(640)&metadata=1&access_token=${token.access_token}`,
        {
          method: 'GET',
        },
      );

      if (!facebookUserInfo.id) {
        throw new Error('Missing facebookUserInfo.id');
      }

      // TODO: add search by userId obtained by the context of the request (no idea how to do it)
      let user = await UserModel.findOne({
        'oauth.facebook': facebookUserInfo.id,
      });

      if (user) {
        // TODO: Set user active if userId is present in the context of the request (no idea how to do it)
        // if (userId) user.set('active', true);

        user.set('oauth.facebook', facebookUserInfo.id);
        if (facebookUserInfo.email) {
          user.set('oauth.emailFacebook', facebookUserInfo.email);
        }
      } else {
        user = new UserModel({
          oauth: {
            facebook: facebookUserInfo.id,
            emailFacebook: facebookUserInfo.email,
          },
          name: facebookUserInfo.name,
          avatar: facebookUserInfo.picture.data.url,
        });
      }

      await user.save();

      // I don't know how to get the context of the request to check if it is inApp
      // Here is the code in the original project
      /* return {
        _redirect:
          inApp.split('?')[0] == 'true'
            ? `ufabcnext://login?token=${await user.generateJWT()}&`
            : `${WEB_URL}/login?token=${user.generateJWT()}`,
      }; 
      */

      const WEB_URL = opts.NODE_ENV === 'dev' ? opts.ORIGIN : opts.WEB_URL;

      reply
        .status(200)
        .redirect(`${WEB_URL}/login?token=${user.generateJWT()}`);
    } catch (error) {
      reply.log.fatal({ error }, 'Error in oauth2');
      return reply.send(error);
    }
  });
}

export default fastifyPlugin(oauth2, {
  name: 'Oauth2',
});
