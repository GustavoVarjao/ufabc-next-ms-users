import type { Config } from '@/config/secret';
import { ProviderConfiguration, Token } from '@fastify/oauth2';

export type UfabcNextOauth2Options = {
  Config: Config;
  provider: 'google' | 'facebook';
  clientId: string;
  clientSecret: string;
};

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

export type Providers = {
  google: ProviderConfig;
  facebook: ProviderConfig;
};
