import { CRON_SECRET } from "$env/static/private"
import prisma from "~/lib/prisma.js";

export const GET = async (request) => {
  const authHeader = request.request.headers.get("authorization")
  if (authHeader !== `Bearer ${CRON_SECRET}`) {
    return new Response('Unauthorized', {
      status: 401,
    });
  }

  prisma.groupInvite.deleteMany({
    where: {
      createdAt: {
        lt: new Date(Date.now() - 1000 * 60 * 60)
      }
    }
  })

  return new Response("OK")
}