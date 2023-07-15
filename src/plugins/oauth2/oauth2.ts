import { FastifyInstance } from 'fastify';
import fastifyPlugin from 'fastify-plugin';
import { FastifyOAuth2Options, fastifyOauth2 } from '@fastify/oauth2';
import { config } from '@/config/secret';
import { getOauthInfo } from '@/helpers/sfetch/get-oauth-info';

/* const sessionConfig = {
  secret: config.GRANT_SECRET,
  cookie: {
    secure: 'auto',
    maxAge: 604800000, // TTL (one week)
  },
} satisfies FastifySessionOptions; */

const facebookOauth2config = {
  name: 'FacebookOauth2Provider',
  scope: ['profile', 'email'],
  credentials: {
    client: {
      id: config.OAUTH_FACEBOOK_KEY,
      secret: config.OAUTH_FACEBOOK_SECRET,
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
      id: config.OAUTH_GOOGLE_CLIENT_ID,
      secret: config.OAUTH_GOOGLE_SECRET,
    },
    auth: fastifyOauth2.GOOGLE_CONFIGURATION,
  },
  startRedirectPath: '/login/google',
  callbackUri: 'http://localhost:5000/oauth/google',
} satisfies FastifyOAuth2Options;

export async function oauth2(app: FastifyInstance, opts: {}) {
  app.register(fastifyOauth2, googleOauth2config);
  app.register(fastifyOauth2, facebookOauth2config);

  app.get('/oauth/google', async function (request, reply) {
    try {
      const { token } =
        await this.GoogleOauth2Provider.getAccessTokenFromAuthorizationCodeFlow(
          request,
        );

      request.log.info({ token }, 'token');
      const data = await getOauthInfo(
        'https://www.googleapis.com/plus/v1/people/me',
        {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${token.access_token}`,
          },
        },
      );

      console.log('data', data);
      reply
        .status(200)
        .redirect('http://localhost:5500/?token="' + token.access_token);
    } catch (error) {
      reply.log.fatal({ error }, 'Error in oauth2');
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

      const WEB_URL =
        config.NODE_ENV === 'dev' ? config.ORIGIN : config.WEB_URL;

      reply
        .status(200)
        .redirect(`${WEB_URL}/login?token=${user.generateJWT()}`);
    } catch (error) {
      reply.log.fatal({ error }, 'Error in oauth2');
      return reply.send(error);
    }
  });
}

export default fastifyPlugin(oauth2);
