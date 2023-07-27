// Implement here the helpers for respective providers
import type { Token } from '@fastify/oauth2';
import type { GoogleUser } from '../types/User';
import { ofetch } from 'ofetch';

export async function getGoogleUserDetails(token: Token) {
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
    const [{ email, googleEmailId }] = user.emailAddresses.map(
      ({ value, metadata }) => ({
        email: value,
        googleEmailId: metadata.source.id,
      }),
    );

    return {
      email,
      googleEmailId,
      provider: 'google',
    };
  } catch (error) {
    console.log('erros', error);
    throw error;
  }
}

export async function getFacebookUserDetails(token: Token) {
  return { msg: 'not implemented yet' };
}
