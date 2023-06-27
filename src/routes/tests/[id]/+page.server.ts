import type { ServerLoad } from "@sveltejs/kit";

type QuestionTransformation = {
  [Key in keyof QuestionTypeMap]: (question: QuestionTypeMap[Key]) => object
}

// Transform the question into data which will not contain answers
const questionTransformation: QuestionTransformation = {
  "pickOne": (question: PickOneQuestion) => {
    return {
      ...question,
      correctAnswerIndex: undefined
    } as PartialPick<PickOneQuestion, "correctAnswerIndex">
  },
  "true/false": (question: TrueFalseQuestion) => {
    return {
      ...question,
      answers: question.answers.map((answer) => {
        return {
          answer: answer,
          isTrue: undefined
        }
      })
    } as unknown as {
        [Key in keyof TrueFalseQuestion]: Key extends "answers" ? PartialPick<TrueFalseQuestion["answers"][number], "isTrue">[] : TrueFalseQuestion[Key]
      }
  }
}

export const load: ServerLoad = async (request) => {
  return {
    ahoj: "world"
  }
}