import { ZodError, z } from "zod"
import { json } from "@sveltejs/kit"
import type { RequestEvent } from "../../dashboard/$types"
import { asnwerSchema as answerObjectSchema, titleSchema } from "~schemas/textInput"
import type { TestObject } from "~stores/testObject"

const asnwerSchema = z.object({
  answer: answerObjectSchema//z.string().min(1, "Answer has to be at least 1 character long.").max(100, "Answer can be max 100 characters long.")
}).passthrough()

const questionSchema = z.object({
  title: titleSchema//z.string().min(8, "Title has to be at least 8 character long.").max(250, "Title can be max 250 characters long."),
})

export async function POST(event: RequestEvent) {
  const body = (await event.request.json()) as TestObject

  const questions = body.questions

  let isError = false

  for (const item of questions) {

    try {
      questionSchema.parse(item)
      item.errors = {}
    }
    catch (e) {
      const error = e as ZodError<typeof asnwerSchema>
      item.errors.title = error.errors[0].message
      isError = true
    }

    if (item.content && item.content.answers) {
      for (const asnwer of item.content.answers)
        try {
          asnwerSchema.parse(asnwer)
          asnwer.error = ""
        }
        catch (e: unknown) {
          const error = e as ZodError<typeof asnwerSchema>
          asnwer.error = error.errors[0].message
          isError = true
        }
    }
  }

  const titleParse = titleSchema.safeParse(body.title)
  if (!titleParse.success) {
    body.errors.title = titleParse.error.message
  }

  const descriptionParse = titleSchema.safeParse(body.description)
  if (!descriptionParse.success) {
    body.errors.description = descriptionParse.error.message
  }

  return json({ store: questions, error: isError })
}