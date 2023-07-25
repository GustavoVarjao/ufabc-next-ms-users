import type { Config } from '@/config/secret';

export type UfabcNextOauth2Options = {
  Config: Config;
  provider: 'google' | 'facebook';
  clientId: string;
  clientSecret: string;
};
