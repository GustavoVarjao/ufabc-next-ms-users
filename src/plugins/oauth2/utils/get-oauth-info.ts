// Implement here the helpers for respective providers
import type { GoogleUser } from '../types/User';
import { Token } from '@fastify/oauth2';
import { request } from 'undici';

export async function getGoogleUserDetails(token: Token) {
  // TODO: identify what we need from the user and perform the filtering here
  // TODO: Add logging for this scope
  try {
    const res = await request(
      'https://people.googleapis.com/v1/people/me?personFields=emailAddresses',
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      },
    );
    const user: GoogleUser = await res.body.json();
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
