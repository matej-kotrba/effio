import { questionContentFunctions } from "~helpers/test"
import { json } from '@sveltejs/kit'
import type { TestObject } from "~stores/testObject.js"
import prisma from "~/lib/prisma.js"

export type CheckTestResponse = {
  error?: string;
  success?: boolean;
  data?: {
    isCorrect?: boolean;
    correctAnswer?: QuestionContent;
    userAnswer?: QuestionContent;
  }[]
}

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
      testVersions: {
        include: {
          questions: true
        },
        take: 1,
        orderBy: {
          version: "desc"
        }
      }

    }
  })

  if (!test) return json({ error: "Test not found!", success: false })

  const result = body.questions.map((question) => {
    const compareQuestion = test.testVersions[0].questions.find(item => item.id === question.id)
    if (!compareQuestion || !Object.keys(questionContentFunctions).includes(question.questionType)) throw new Error("Question not found!")

    // This would cost additional reads which should not be neccecary
    // if (compareQuestion.type.slug !== question.questionType) throw new Error("Question type mismatch!")

    return {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      isCorrect: questionContentFunctions[question.questionType].checkAnswerCorrectness(question.content, compareQuestion.content),
      correctAnswer: compareQuestion.content,
      userAnswer: question.content
    } as CheckTestResponse
  })


  return json({ error: undefined, success: true, data: result })
}