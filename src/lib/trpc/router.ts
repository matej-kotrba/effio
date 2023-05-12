import { initTRPC } from "@trpc/server";
import { z } from "zod"
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create()

export const router = t.router({
  getTemplates: t.procedure.query(async ({ ctx }) => {
    const templates = await ctx.prisma.template.findMany()
    return templates
  })
})

export type Router = typeof router