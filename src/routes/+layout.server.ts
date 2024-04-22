import type { Session } from "@auth/core/types";
import type { LayoutServerLoad } from "./$types";
import prisma from "~/lib/prisma";

export const load: LayoutServerLoad = async (event) => {

  const hasLoggedOut = event.url.searchParams.has("logout")
  const message = event.url.searchParams.get("message")
  const type = event.url.searchParams.get("type")

  // const users = await prisma.user.findMany()
  // for (const user of users) {

  // }

  return {
    session: await event.locals.getSession() as Session & { user?: { id: string } },
    hasLoggedOut,
    message: {
      text: message,
      type: type === "success" ? "success" : "error"
    } as const
  };
};