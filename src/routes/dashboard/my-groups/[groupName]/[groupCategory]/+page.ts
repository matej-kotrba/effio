import { redirect } from "@sveltejs/kit"

export const load = async (event) => {
  throw redirect(307, event.url.pathname + "/chat")
}