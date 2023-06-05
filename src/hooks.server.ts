import { sequence } from "@sveltejs/kit/hooks";
import { createContext } from "./lib/trpc/context";
import { router } from "./lib/trpc/router"
import type { Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit"
import { SvelteKitAuth } from "@auth/sveltekit"
import prisma from "$lib/prisma";
import GitHub from "@auth/core/providers/github"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { GITHUB_ID, GITHUB_SECRET, AUTH_SECRET } from "$env/static/private"

const handleTRPCContext: Handle = createTRPCHandle({
  router: router,
  createContext: createContext,
})

const handleAuth: Handle = SvelteKitAuth({
  // Created PrismaAdapter with the Prisma client instance
  adapter: PrismaAdapter(prisma),
  providers: [GitHub({ clientId: GITHUB_ID, clientSecret: GITHUB_SECRET })],
  secret: AUTH_SECRET,
  callbacks: {
    async signIn({ account, user }) {
      return true // Default behavior for other providers
    },
  },
  pages: {
    // signIn: "/logins"
  }
})

export const handle = sequence(handleTRPCContext)
