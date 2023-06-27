import type { ServerLoad } from "@sveltejs/kit";

export const load: ServerLoad = async (request) => {
  return {
    ahoj: "world"
  }
}