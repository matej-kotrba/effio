import type { Session } from "@auth/core/types";
import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {

  const hasLoggedOut = event.url.searchParams.has("logout")
  const message = event.url.searchParams.get("message")
  const type = event.url.searchParams.get("type")

  return {
    session: await event.locals.getSession() as Session & { user?: { id: string } },
    hasLoggedOut,
    message: {
      text: message,
      type: type === "success" ? "success" : "error"
    } as const
  };
};