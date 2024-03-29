import { sequence } from "@sveltejs/kit/hooks";
import { createContext } from "./lib/trpc/context";
import { appRouter } from "./lib/trpc/router"
import { redirect, type Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit"
import { SvelteKitAuth } from "@auth/sveltekit"
import prisma from "$lib/prisma";
import GitHub from "@auth/core/providers/github"
import Google from "@auth/core/providers/google"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { GITHUB_ID, GITHUB_SECRET, AUTH_SECRET, GOOGLE_ID, GOOGLE_SECRET } from "$env/static/private"
import type { Session, User } from "@auth/core/types";
import type { AdapterUser } from "@auth/core/adapters";

const handleTRPCContext: Handle = createTRPCHandle({
  router: appRouter,
  createContext: createContext,
  responseMeta() {
    // if (opts.paths?.includes("getTags")) {
    //   return {
    //     headers: {
    //       "Cache-Control": "public, max-age=86400"
    //     }
    //   }
    // }
    // if (opts.paths?.includes("getPopularTests") || opts.paths?.includes("getUserTestsById")) {
    //   return {
    //     headers: {
    //       "Cache-Control": "public, max-age=60"
    //     }
    //   }
    // }
    return {}
  }
})

const prismaAdapter = PrismaAdapter(prisma)
// prismaAdapter.linkAccount = (data => {
//   })
//   return prisma.account.create({
//     data: {
//       expires_at: data.expires_in ? data.expires_in : data.expires_at,
//       ...data,
//     }
//   })
// })

const handleAuth: Handle = SvelteKitAuth({
  // Created PrismaAdapter with the Prisma client instance
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  adapter: prismaAdapter,
  providers: [
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET, }),
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Google({ clientId: GOOGLE_ID, clientSecret: GOOGLE_SECRET })
  ],
  secret: AUTH_SECRET,

  callbacks: {
    session: async ({ session, user }: { session: Session, user: User | AdapterUser }): Promise<UpdatedSession> => {
      const newSession: UpdatedSession = session
      const newUser: UpdatedUser = user as UpdatedUser

      if (newSession?.user && user) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newSession.user!.id = user.id as string;
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        newSession.user!.role = newUser.role
      }
      return newSession as UpdatedSession;
    },
    signIn: async () => {
      return Promise.resolve(true)
    }
  },
})

const handleRedirectBasedOnAuthStatus: Handle = async ({ event, resolve }) => {

  const session = await event.locals.getSession()
  if (event.url.pathname.startsWith("/dashboard") && !(session?.user)) {
    throw redirect(303, "/login")
  }

  if (event.url.pathname.startsWith("/login") && (session?.user)) {
    throw redirect(303, "/dashboard")
  }

  if (event.url.pathname.startsWith("/admin") && (!(session?.user) || session?.user?.role !== "ADMIN")) {
    throw redirect(303, "/")
  }

  return resolve(event)
}

export const handle = sequence(handleAuth, handleTRPCContext, handleRedirectBasedOnAuthStatus)
