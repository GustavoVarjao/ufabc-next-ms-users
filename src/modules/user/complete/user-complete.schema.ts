import { z } from 'zod';

export const UfabcUser = z.object({
  email: z.string().email(),
  ra: z.string(),
});

export type UfabcUser = z.infer<typeof UfabcUser>;
