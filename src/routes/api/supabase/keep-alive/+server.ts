import type { Tag } from '@prisma/client';
import prisma from '~/lib/prisma.js';
import { redis } from '~/lib/server/redis/redis';

export const GET = async () => {
  let tags: Tag[] = []
  try {
    // Just some data fetching to keep the Supabase instance alive
    tags = await prisma.tag.findMany();
    redis.set('keep-alive', Math.random().toString())
  }
  catch {
    return new Response('Error fetching data', { status: 500 });
  }
  return new Response(JSON.stringify(tags));
}