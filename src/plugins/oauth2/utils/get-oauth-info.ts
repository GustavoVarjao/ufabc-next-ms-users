// Implement here the helper for respective providers
import { Token } from '@fastify/oauth2';
import { request } from 'undici';

export async function getGoogleUserDetails(token: Token) {
  // TODO: identify what we need from the user and perform the filtering here
  try {
    const res = await request('https://www.googleapis.com/plus/v1/people/me', {
      headers: {
        Authorization: `Bearer ${token.access_token}`,
      },
    });
    const user: Record<string, unknown> = await res.body.json();
    return { user };
  } catch (error) {
    console.log('erros', error);
    throw error;
  }
}
