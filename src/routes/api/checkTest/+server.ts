import { questionContentFunctions } from "~helpers/test"
import { json } from '@sveltejs/kit'
import type { TestObject } from "~stores/testObject.js"

export async function POST(event) {
  const body = (await event.request.json()) as TestObject
  if (!body) return json({ error: "No body attached!", success: false })

  if (body.questions.some(question => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return !(questionContentFunctions[question.questionType]["checkAnswerPresence"](question.content as any))
  })) return json({ error: "Not all questions has been filled!", success: false })

  return json({ error: undefined, success: true })
}