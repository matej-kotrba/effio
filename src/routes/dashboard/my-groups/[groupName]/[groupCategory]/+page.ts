import { redirect } from "@sveltejs/kit"

export const load = async (event) => {
  const pathname = event.url.pathname
  throw redirect(307, pathname.at(-1) === "/" ? "chat" : "/chat")
}