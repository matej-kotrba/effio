import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } from "$env/static/private"
import { TRPCError } from "@trpc/server";

const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN,
})

export const ratelimit = {
  testCreation: new Ratelimit({
    redis,
    prefix: "ratelimit:create",
    limiter: Ratelimit.slidingWindow(1, "30s")
  }),
  testUpdate: new Ratelimit({
    redis,
    prefix: "ratelimit:update",
    limiter: Ratelimit.slidingWindow(1, "10s")
  }),
  testDeletion: new Ratelimit({
    redis,
    prefix: "ratelimit:delete",
    limiter: Ratelimit.slidingWindow(5, "10s")
  }),
  testStar: new Ratelimit({
    redis,
    prefix: "ratelimit:star",
    limiter: Ratelimit.slidingWindow(10, "10s")
  }),
  groupCreation: new Ratelimit({
    redis,
    prefix: "ratelimit:group:create",
    limiter: Ratelimit.slidingWindow(1, "20s")
  }),
}

export async function trpcCheckForRateLimit(rateLimit: keyof typeof ratelimit, userId: string, stringToFill: string) {
  // Neblokují se groupy i když by měli, tak se na to musím podívat
  let rateLimitSuccess = true
  let rateLimitReset = 0
  try {
    const { success, reset } = await ratelimit[rateLimit].limit(
      userId
    )
    console.log(success)
    rateLimitSuccess = success
    rateLimitReset = reset
  }
  catch { 0 }

  if (!rateLimitSuccess) {
    throw new TRPCError({ code: "TOO_MANY_REQUESTS", "message": `Hold up there pal!\n You are ${stringToFill} too fast, please wait ${(rateLimitReset - Date.now()) / 1000}s and try again.` })
  }
}