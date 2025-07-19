import { dev } from "$app/environment"
import { error, type RequestEvent } from "@sveltejs/kit"

// Checks whether origini of the request is allowed (only allowed should be Effio itself), if not, throws an error
export const checkRequestOrigin = (event: RequestEvent) => {
  const originURL = dev ? "http://localhost:5173" : "https://effio.vercel.app"
  if (event.url.origin !== originURL) error(401, "Unauthorized, origin is not allowed");
}