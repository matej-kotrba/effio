import { ZodError, z } from "zod"
import { json } from "@sveltejs/kit"
import type { RequestEvent } from "../../dashboard/$types"
import { asnwerSchema as answerObjectSchema, titleSchema } from "~schemas/textInput"
import type { TestObject } from "~stores/testObject"
import { isTestValid } from "~helpers/test"

export async function POST(event: RequestEvent) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await event.request.json() as { [key: string]: any }

  const props = {
    title: data.title || undefined,
    description: data.description || undefined,
    questions: data.questions || undefined
  }

  const response = isTestValid(props)

  return json(response)
  // const body = (await event.request.json()) as TestObject

  // const questions = body.questions

  // let isError = false

  // for (const item of questions) {

  //   try {
  //     questionSchema.parse(item)
  //     item.errors = {}
  //   }
  //   catch (e) {
  //     const error = e as ZodError<typeof asnwerSchema>
  //     item.errors.title = error.errors[0].message
  //     isError = true
  //   }

  //   if (item.content && item.content.answers) {
  //     for (const asnwer of item.content.answers)
  //       try {
  //         asnwerSchema.parse(asnwer)
  //         asnwer.error = ""
  //       }
  //       catch (e: unknown) {
  //         const error = e as ZodError<typeof asnwerSchema>
  //         asnwer.error = error.errors[0].message
  //         isError = true
  //       }
  //   }
  // }

  // const titleParse = titleSchema.safeParse(body.title)
  // if (!titleParse.success) {
  //   body.errors.title = titleParse.error.message
  // }

  // const descriptionParse = titleSchema.safeParse(body.description)
  // if (!descriptionParse.success) {
  //   body.errors.description = descriptionParse.error.message
  // }

  // return json({ store: questions, error: isError })
}