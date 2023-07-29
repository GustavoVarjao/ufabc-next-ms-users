import type {
  Credentials,
  ProviderConfiguration,
  Token,
} from '@fastify/oauth2';
import { UfabcNextOAuth2User } from './UfabcNextOAuth2User';

type ProviderName = 'google' | 'facebook';
type ProviderConfig = {
  config: ProviderConfiguration;
  scope: string[];
  credentials: Omit<Credentials, 'auth'>;
  getUserDetails: (token: Token) => Promise<UfabcNextOAuth2User>;
};
export type Providers = Record<ProviderName, ProviderConfig>;

/**
 * @description writing a custom cause original Object.keys sucks with Typescript
 * @link https://twitter.com/mattpocockuk/status/1681267079977000961
 */
export const objectKeys = <TObject extends object>(
  obj: TObject,
): Array<keyof TObject> => {
  return Object.keys(obj) as Array<keyof TObject>;
};
