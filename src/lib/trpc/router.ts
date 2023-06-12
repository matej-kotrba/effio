import { TRPCError, initTRPC } from "@trpc/server";
import { z } from "zod"
import type { Context } from "./context";

export const t = initTRPC.context<Context>().create()

// Schema of template question type
const schema = z.object({
  id: z.string(),
  createdAt: z.date(),
  name: z.string(),
  properties: z.object({
    inputType: z.string(),
    question: z.array(z.string()),
  }).and(z.record(z.unknown()))
})

export type QuestionTemplate = z.infer<typeof schema>

const isLoggedIn = t.middleware(async (opts) => {
  if (!opts.ctx.user) {
    throw new TRPCError({ code: "UNAUTHORIZED", message: "You are not logged in" })
  }
  return opts.next({
    ctx: {
      user: opts.ctx.user
    }
  })
})

const passwordProcedure = t.procedure.use(isLoggedIn)

const protectedRouter = t.router({
  saveTest: passwordProcedure.mutation(async ({ ctx }) => {
    await ctx.prisma.test.create({
      data: {
        title: "AHOJ",
        ownerId: ctx.user.id,

      }
    })
    return "ahoj"
  })
})

export const router = t.router({
  getTemplates: t.procedure.query(async ({ ctx }) => {
    const templates = await ctx.prisma.template.findMany()
    return templates
  }),
  getQuestionsTypes: t.procedure.query(async ({ ctx }) => {
    const questionsTypes = await ctx.prisma.questionType.findMany()
    // Manual check if the field is correct will be performed here because of the JSON field
    const result = []
    for (const questionType of questionsTypes) {
      const validationResult = schema.passthrough().safeParse(questionType)
      if (validationResult.success) {
        result.push(validationResult.data)
      }
    }
    // This needs to be converted to unkown because of the JSON field
    // But its 100% safe because of the manual check above
    return result
  }),
  protected: protectedRouter
})

export type Router = typeof router

// import type { RequestHandler } from "./$types"
// import { json } from "@sveltejs/kit"
// import { z } from "zod"

// const schemas = z.object({
//   title: z.string(),
//   description: z.string(),
//   questions: z.array(z.object({}).passthrough())
// })

// export const POST: RequestHandler = async ({ request, locals }) => {
//   if (!locals.getSession()) return json({ status: 403, body: "Unauthorized" })
//   const { body } = request
//   try {
//     schemas.parse(body)
//   }
//   catch (e) {
//     return json({ status: 400, body: e })
//   }
//   return json({ status: 200, body: "Hello World!" })
// }