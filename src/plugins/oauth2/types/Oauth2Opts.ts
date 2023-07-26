import { ProviderConfiguration, Token } from '@fastify/oauth2';

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

type ProviderName = 'google' | 'facebook' | string;

export type Providers = Record<ProviderName, ProviderConfig>;
