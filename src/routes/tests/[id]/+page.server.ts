import { redirect, type ServerLoad } from "@sveltejs/kit";
import { router } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context"

type QuestionTransformation = {
  [Key in keyof QuestionTypeMap]: (question: QuestionTypeMap[Key]) => object
}

function questionCreator(question: QuestionTypeMap[keyof QuestionTypeMap]): QuestionTypeMap[keyof QuestionTypeMap] {
  return {
    ...question,

  }
}

// Transform the question into data which will not contain answers
const questionContentTransformation: QuestionTransformation = {
  "pickOne": (question: PickOneQuestionContent) => {
    return {
      ...question,
      correctAnswerIndex: undefined
    } as PartialPick<PickOneQuestionContent, "correctAnswerIndex">
  },
  "true/false": (question: TrueFalseQuestionContent) => {
    return {
      ...question,
      answers: question.answers.map((answer) => {
        return {
          answer: answer,
          isTrue: undefined
        }
      })
    } as unknown as {
        [Key in keyof TrueFalseQuestionContent]: Key extends "answers" ? PartialPick<TrueFalseQuestionContent["answers"][number], "isTrue">[] : TrueFalseQuestionContent[Key]
      }
  }
}

export const load: ServerLoad = async (request) => {

  const id = request.params.id;

  if (!id) throw redirect(302, "/")

  const context = await createContext(request)

  const test = await router.createCaller(context).getTestById({ id: id });

  if (!test) throw redirect(302, "/")

  const questionTypeOptions = Object.keys(questionContentTransformation)
  console.log(test.questions)

  const editedTest = test.questions.map((question) => {
    if (!questionTypeOptions.some((key) => key === question.type.slug)) throw redirect(302, "/")
    return questionContentTransformation[question.type.slug as keyof QuestionTransformation](question)
  })

  console.log(editedTest)

  return {
    // testContent: 
  }
}