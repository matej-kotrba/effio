import type { Tag } from '@prisma/client';
import prisma from '~/lib/prisma.js';

export const GET = async () => {
  let tags: Tag[] = []
  try {
    // Just some data fetching to keep the Supabase instance alive
    tags = await prisma.tag.findMany();
  }
  catch {
    return new Response('Error fetching data', { status: 500 });
  }
  return new Response(JSON.stringify(tags));
}