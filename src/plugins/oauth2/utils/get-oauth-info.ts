// Implement here the helpers for respective providers
import type { Token } from '@fastify/oauth2';
import type {
  GoogleUser,
  UfabcNextOAuth2User,
} from '../types/UfabcNextOAuth2User';
import { ofetch } from 'ofetch';

export async function getGoogleUserDetails(
  token: Token,
): Promise<UfabcNextOAuth2User> {
  // TODO: identify what we need from the user and perform the filtering here
  // TODO: Add logging for this scope
  try {
    const user = await ofetch<GoogleUser>(
      'https://people.googleapis.com/v1/people/me?personFields=emailAddresses',
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    );
    const [{ email, providerId }] = user.emailAddresses.map(
      ({ value, metadata }) => ({
        email: value,
        providerId: metadata.source.id,
      }),
    );

    if (!providerId) {
      throw new Error('Missing Google id');
    }

    return {
      email,
      providerId,
      provider: 'google',
    };
  } catch (error) {
    console.log('erros', error);
    throw error;
  }
}

export async function getFacebookUserDetails(
  token: Token,
): Promise<UfabcNextOAuth2User> {
  // TODO: Do later with HTTPS
  const user = await ofetch(`https://graph.facebook.com/v6.0/me`, {
    headers: {
      Authorization: `Bearer ${token.access_token}`,
    },
  });

  return {
    providerId: user.id,
    email: user.email,
    provider: 'facebook',
  };
}
