import { sequence } from "@sveltejs/kit/hooks";
import { createContext } from "./lib/trpc/context";
import { router } from "./lib/trpc/router"
import type { Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit"

const handleTRPCContext: Handle = createTRPCHandle({
  router: router,
  createContext: createContext,
})

export const handle = sequence(handleTRPCContext)