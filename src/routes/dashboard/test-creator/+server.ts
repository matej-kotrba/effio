import { z } from "zod"
import { json } from "@sveltejs/kit"
import type { RequestEvent } from "../$types"
import type { QuestionsDataType } from "~components/testCreator/Creator.svelte"

export async function POST(event: RequestEvent) {
  const body = (await event.request.json()) as QuestionsDataType[]

  for (const item of body) {
    console.log(item.content)
  }

  return json("SUPER")
}