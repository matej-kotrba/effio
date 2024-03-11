import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import { UPSTASH_REDIS_URL, UPSTASH_REDIS_TOKEN } from "$env/static/private"

const redis = new Redis({
  url: UPSTASH_REDIS_URL,
  token: UPSTASH_REDIS_TOKEN,
})

export const ratelimit = {
  testCreation: new Ratelimit({
    redis,
    prefix: "ratelimit:create",
    limiter: Ratelimit.slidingWindow(1, "60s")
  }),
  testDeletion: new Ratelimit({
    redis,
    prefix: "ratelimit:delete",
    limiter: Ratelimit.slidingWindow(5, "10s")
  }),
}