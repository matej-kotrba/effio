import { z } from "zod"
import { json } from "@sveltejs/kit"
import type { RequestEvent } from "../$types"
import type { QuestionsDataType } from "~components/testCreator/Creator.svelte"

const asnwerSchema = z.object({
  answer: z.string().min(1).max(100)
}).passthrough()

export async function POST(event: RequestEvent) {
  const body = (await event.request.json()) as QuestionsDataType[]

  for (const item of body) {
    if (item.content && item.content.answers) {
      for (const asnwer of item.content.answers)
        try {
          asnwerSchema.parse(asnwer)
        }
        catch (e) {
          console.log(e)
          // asnwer.error = e.message
        }
    }
  }

  return json("SUPER")
}