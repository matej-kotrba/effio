import { sequence } from "@sveltejs/kit/hooks";
import { createContext } from "./lib/trpc/context";
import { router } from "./lib/trpc/router"
import type { Handle } from "@sveltejs/kit";
import { createTRPCHandle } from "trpc-sveltekit"
import { auth } from "$lib/server/lucia";

const handleTRPCContext: Handle = createTRPCHandle({
  router: router,
  createContext: createContext,
})

const initializeLuciaAuth: Handle = async ({ event, resolve }) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  event.locals.auth = auth.handleRequest(event);
  return await resolve(event);
};

export const handle = sequence(handleTRPCContext, initializeLuciaAuth)