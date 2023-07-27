import type { FastifyReply, FastifyRequest } from 'fastify';
import { nextUsageInfo } from './next-usage.service';

export async function getNextUsage(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const currentNextUsage = await nextUsageInfo();
  // const CACHE_KEY = `next-usage`;
  // const cached = await request.server.redis.get(CACHE_KEY);
  // if (cached) {
  //   return cached;
  // }
  // await request.server.redis.set(
  //   CACHE_KEY,
  //   JSON.stringify(currentNextUsage),
  //   'EX',
  //   60 * 60,
  // );
  return reply.code(200).send(currentNextUsage);
}
