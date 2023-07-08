import { questionContentFunctions } from "~helpers/test"
import { json } from '@sveltejs/kit'
import type { TestObject } from "~stores/testObject.js"
import prisma from "~/lib/prisma.js"

export async function POST(event) {
  const body = (await event.request.json()) as TestObject
  if (!body) return json({ error: "No body attached!", success: false })

  if (body.questions.some(question => {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return !(questionContentFunctions[question.questionType]["checkAnswerPresence"](question.content as any))
  })) return json({ error: "Not all questions has been filled!", success: false })

  // Get test from DB so we can access correct answers
  const test = await prisma.test.findUnique({
    where: {
      id: body.id
    },
    include: {
      questions: true
    }
  })

  if (!test) return json({ error: "Test not found!", success: false })

  const result = body.questions.map((question, index) => {
    return {
      isCorrect: questionContentFunctions[question.questionType]["checkAnswerCorrectness"](question.content as any, test.questions[index].content as any)
    }
  })

  return json({ error: undefined, success: true })
}