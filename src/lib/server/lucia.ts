import lucia from "lucia-auth";
import { sveltekit } from "lucia-auth/middleware";
import prisma from "@lucia-auth/adapter-prisma";
import { dev } from "$app/environment";
import PrismaClient from "$lib/prisma"

export const auth = lucia({
  adapter: prisma(PrismaClient),
  env: dev ? "DEV" : "PROD",
  middleware: sveltekit()
});

export type Auth = typeof auth;