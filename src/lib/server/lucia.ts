import lucia from "lucia-auth";
import { sveltekit } from "lucia-auth/middleware";
import prisma from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import client from "$lib/prisma"

export const auth = lucia({
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  adapter: prisma(client as any),
  env: dev ? "DEV" : "PROD",
  middleware: sveltekit()
});

export type Auth = typeof auth;