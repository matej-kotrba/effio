import { initTRPC } from "@trpc/server";
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
    return questionsTypes as unknown as QuestionTemplate[]
  })
})

export type Router = typeof router