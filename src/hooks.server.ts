import { sequence } from "@sveltejs/kit/hooks";
import { createContext } from "./lib/trpc/context";
import { router } from "./lib/trpc/router"
import { redirect, type Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit"
import { SvelteKitAuth } from "@auth/sveltekit"
import prisma from "$lib/prisma";
import GitHub from "@auth/core/providers/github"
import Google from "@auth/core/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { GITHUB_ID, GITHUB_SECRET, AUTH_SECRET, GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private"
import type { DefaultSession, User } from "@auth/core/types";
import type { AdapterUser } from "@auth/core/adapters";

const handleTRPCContext: Handle = createTRPCHandle({
  router: router,
  createContext: createContext,
})

const handleAuth: Handle = SvelteKitAuth({
  // Created PrismaAdapter with the Prisma client instance
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  adapter: PrismaAdapter(prisma),
  providers: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET })
  ],
  secret: AUTH_SECRET,
  callbacks: {
    session: async ({ session, user }: { session: UpdatedSession, user: User | AdapterUser }) => {

      if (session?.user && user) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        session.user!.id = user.id as string;
      }

      return session;
    },
  }
})

const handleRedirectBasedOnAuthStatus: Handle = async ({ event, resolve }) => {

  if (event.url.pathname.startsWith("/dashboard") && !(await event.locals.getSession())?.user) {
    throw redirect(303, "/")
  }

  if (event.url.pathname.startsWith("/login") && (await event.locals.getSession())?.user) {
    throw redirect(303, "/dashboard")
  }

  return resolve(event)
}

export const handle = sequence(handleAuth, handleTRPCContext, handleRedirectBasedOnAuthStatus)
