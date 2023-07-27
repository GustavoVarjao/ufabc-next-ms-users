import type { ProviderConfiguration, Token } from '@fastify/oauth2';

type ProviderName = 'google' | 'facebook';
type ProviderConfig = {
  config: ProviderConfiguration;
  scope: string[];
  credentials: {
    client: {
      id: string;
      secret: string;
    };
  };
  getUserDetails: (token: Token) => Promise<Record<string, unknown>>;
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
