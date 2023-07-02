import { questionContentFunctions } from "~helpers/test"
import { json } from '@sveltejs/kit'

export async function POST(event) {
  const body = (await event.request.json()) as Question[]
  if (!body) return json({ error: "No body attached!" })

  if (body.some(question => {
    console.log(question.content)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return !(questionContentFunctions[question.questionType]["checkAnswerPresence"](question.content as any))
  })) return json({ error: "Not all questions has been filled!" })

}