import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } from "$env/static/private"
import { TRPCError } from "@trpc/server";

export const redis = new Redis({
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
  groupUpdate: new Ratelimit({
    redis,
    prefix: "ratelimit:group:update",
    limiter: Ratelimit.slidingWindow(4, "10s")
  }),
  groupDeletion: new Ratelimit({
    redis,
    prefix: "ratelimit:group:delete",
    limiter: Ratelimit.slidingWindow(2, "10s")
  }),
  groupLeave: new Ratelimit({
    redis,
    prefix: "ratelimit:group:leave",
    limiter: Ratelimit.slidingWindow(3, "10s")
  }),
  groupKick: new Ratelimit({
    redis,
    prefix: "ratelimit:group:kick",
    limiter: Ratelimit.slidingWindow(3, "10s")
  }),
  channelCreate: new Ratelimit({
    redis,
    prefix: "ratelimit:channel:create",
    limiter: Ratelimit.slidingWindow(2, "15s")
  }),
  channelUpdate: new Ratelimit({
    redis,
    prefix: "ratelimit:channel:update",
    limiter: Ratelimit.slidingWindow(2, "10s")
  }),
  channelDelete: new Ratelimit({
    redis,
    prefix: "ratelimit:channel:delete",
    limiter: Ratelimit.slidingWindow(2, "10s")
  }),
  channelConnectionToTests: new Ratelimit({
    redis,
    prefix: "ratelimit:channel:connection:test",
    limiter: Ratelimit.slidingWindow(2, "10s")
  }),
  testAttemptCreation: new Ratelimit({
    redis,
    prefix: "ratelimit:test:attempt",
    limiter: Ratelimit.slidingWindow(2, "10s")
  }),
  userToggleFollow: new Ratelimit({
    redis,
    prefix: "ratelimit:user:follow",
    limiter: Ratelimit.slidingWindow(6, "10s"),
  })
}

export async function trpcCheckForRateLimit(rateLimit: keyof typeof ratelimit, userId: string, stringToFill: string): Promise<TRPCError | void> {
  let rateLimitSuccess = true
  let rateLimitReset = 0
  try {
    const { success, reset } = await ratelimit[rateLimit].limit(
      userId
    )
    rateLimitSuccess = success
    rateLimitReset = reset
  }
  catch { 0 }

  if (!rateLimitSuccess) {
    return new TRPCError({ code: "TOO_MANY_REQUESTS", "message": `Hold up there pal!\n You are ${stringToFill} too fast, please wait ${(rateLimitReset - Date.now()) / 1000}s and try again.` })
  }
}