import { redirect, type ServerLoad } from "@sveltejs/kit";
import { router } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context"

// Type which takes the question and creates a question without the answer input
// (PickOne without answer in answers array ...)

type QuestionTransformation = {
  [Key in keyof QuestionTypeMap]: (question: QuestionTypeMap[Key]) => object
}

type QuestionContentTransformation = {
  [Key in keyof QuestionTypeMap]: {
    "separateAnswer": (question: QuestionTypeMap[Key]) => object,
    "checkAnswerPresence": (question: QuestionTypeMap[Key]) => boolean
  }
}

// Transform the question into data which will not contain answers
const questionContentTransformation: QuestionContentTransformation = {
  "pickOne": {
    "separateAnswer": (question: PickOneQuestion): PartialPick<PickOneQuestion, "correctAnswerIndex"> => {
      return {
        ...question,
        correctAnswerIndex: undefined
      }
    },
    "checkAnswerPresence": (question: PickOneQuestion): boolean => {
      return !(question.correctAnswerIndex === undefined)
    },
  },
  "true/false": {
    "separateAnswer": (question: TrueFalseQuestion): { [Key in keyof TrueFalseQuestion as Key extends "answers" ? never : Key]: TrueFalseQuestion[Key];
    } & { answers: PartialPick<TrueFalseQuestion["answers"][number], "error">[] } => {
      return {
        ...question,
        answers: question.answers.map((item) => {
          return {
            answer: item.answer,
            isTrue: false,
          }
        })
      }
    },
    "checkAnswerPresence": (question: TrueFalseQuestion): boolean => {
      return question.answers.every((item) => item.isTrue !== undefined)
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

  const editedQuestions = test.questions.map((question) => {
    // check if the question type exists in the object above, if so then redirect to homepage
    if (!questionTypeOptions.some((key) => key === question.type.slug)) throw redirect(302, "/")
    return {
      ...question,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      content: questionContentTransformation[question.type.slug as keyof QuestionTransformation]["separateAnswer"](question.content)
    }
  })

  return {
    testContent: {
      ...test,
      questions: editedQuestions
    }
  }
}