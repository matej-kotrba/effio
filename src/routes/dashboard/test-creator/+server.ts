import { ZodError, z } from "zod"
import { json } from "@sveltejs/kit"
import type { RequestEvent } from "../$types"
import type { QuestionsDataType } from "~components/testCreator/Creator.svelte"

const asnwerSchema = z.object({
  answer: z.string().min(1, "Answer has to be atleast 1 character long.").max(100, "Answer can be max 100 characters long.")
}).passthrough()

export async function POST(event: RequestEvent) {
  const body = (await event.request.json()) as QuestionsDataType[]

  for (const item of body) {
    if (item.content && item.content.answers) {
      for (const asnwer of item.content.answers)
        try {
          asnwerSchema.parse(asnwer)
        }
        catch (e: unknown) {
          const error = e as ZodError<typeof asnwerSchema>
          asnwer.error = error.errors[0].message
        }
    }
  }

  console.log(body[0].content)

  return json(body)
}