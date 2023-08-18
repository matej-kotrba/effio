import type { TestFullType } from "~/Prisma";
import { testObject, type TestObject } from "~stores/testObject";
import { z } from "zod"
import { answerSchema as answerObjectSchema, answerSchema, descriptionSchema, titleSchema } from "~schemas/textInput"
import { enviromentFetch } from "./fetch";
import type { CheckTestResponse } from "~/routes/api/checkTest/+server";
import { trpc } from "../trpc/client";


type QuestionContentTransformation = {
  [Key in keyof QuestionTypeMap]: {
    // Creates new blank question of the specific type
    "createNew": () => QuestionTypeMap[Key],

    // Type which takes the question and creates a question without the answer input
    // (PickOne without answer in answers array ...)
    "separateAnswer": (question: QuestionTypeMap[Key]) => object,

    // Type which takes the question and checks if the answer of the specific question type is present
    "checkAnswerPresence": (question: QuestionTypeMap[Key]) => boolean,
    "checkAnswerCorrectness": (q1: QuestionTypeMap[Key], q2: QuestionTypeMap[Key]) => boolean,
    "checkCreatorCorrectFormat": (content: QuestionTypeMap[Key]) => { isError: boolean, message: string, store: QuestionTypeMap[Key] }
  }
}

export const QUESTION_LIMIT = 25;

// Transform the question into data which will not contain answers
export const questionContentFunctions: QuestionContentTransformation = {
  "pickOne": {
    "createNew": () => {
      return {
        type: 'pickOne',
        correctAnswerIndex: 0,
        answers: [
          {
            answer: ''
          },
          {
            answer: ''
          }
        ]
      }
    },
    "separateAnswer": (question: PickOneQuestion): PartialPick<PickOneQuestion, "correctAnswerIndex"> => {
      return {
        ...question,
        correctAnswerIndex: undefined
      }
    },
    "checkAnswerPresence": (question: PickOneQuestion): boolean => {
      return !(question.correctAnswerIndex === undefined)
    },
    "checkAnswerCorrectness": (answer: PickOneQuestion, original: PickOneQuestion) => {
      return answer.correctAnswerIndex === original.correctAnswerIndex
    },
    "checkCreatorCorrectFormat": (content: PickOneQuestion) => {
      let isError = false
      let message = ""

      if (content.correctAnswerIndex === undefined || content.correctAnswerIndex > content.answers.length - 1 || content.correctAnswerIndex < 0) {
        isError = true
        message = "Please select the correct answer."
      }

      for (const item in content.answers) {
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    }
  },
  "true/false": {
    "createNew": () => {
      return {
        type: 'true/false',
        answers: [
          {
            answer: '',
            isTrue: false
          },
          {
            answer: '',
            isTrue: false
          }
        ]
      }
    },
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
    },
    "checkAnswerCorrectness": (answer: TrueFalseQuestion, original: TrueFalseQuestion) => {
      return answer.answers.every((item, index) => item.isTrue === original.answers[index].isTrue)
    },
    "checkCreatorCorrectFormat": (content: TrueFalseQuestion) => {
      let isError = false

      for (const item in content.answers) {
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    }
  },
  "connect": {
    "createNew": () => {
      return {
        type: 'connect',
        answers: [
          {
            answer: '',
            matchedAnswerIndex: undefined,
          },
          {
            answer: '',
            matchedAnswerIndex: undefined,
          }
        ],
        matchedAnswers: {
          [crypto.randomUUID()]: {
            answer: ""
          },
          [crypto.randomUUID()]: {
            answer: ""
          }
        }
      }
    },
    "separateAnswer": (question: ConnectQuestion): ConnectQuestion => {
      return {
        ...question,
        answers: question.answers.map((item) => {
          return {
            answer: item.answer,
            matchedAnswerIndex: undefined
          }
        })
      }
    },
    "checkAnswerPresence": (question: ConnectQuestion): boolean => {
      const answersCount = Object.keys(question.matchedAnswers).length
      const userAnswersCount = question.answers.filter((item) => item.matchedAnswerIndex !== undefined).length

      return answersCount === userAnswersCount
    },
    "checkAnswerCorrectness": (answer: ConnectQuestion, original: ConnectQuestion) => {
      if (answer.answers.length !== original.answers.length) return false
      for (const i in answer.answers) {
        if (answer.answers[i].matchedAnswerIndex !== original.answers[i].matchedAnswerIndex) return false
      }
      return true
    },
    "checkCreatorCorrectFormat": (content: ConnectQuestion) => {
      let isError = false

      for (const item in content.answers) {
        if (content.answers[item].matchedAnswerIndex == undefined) {
          isError = true
          content.answers[item].error = "Please select the correct answer."
          continue
        }
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      for (const item in content.matchedAnswers) {
        const result = answerSchema.safeParse(content.matchedAnswers[item].answer)
        if (result.success === false) {
          isError = true
          content.matchedAnswers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    }
  },
  "write": {
    "createNew": () => {
      return {
        type: 'write',
        answers: [
          {
            answer: ''
          }
        ]
      }
    },
    "separateAnswer": (question: WriteQuestion): WriteQuestion => {
      return {
        ...question,
        answers: [{ answer: "" }]
      }
    },
    "checkAnswerPresence": (question: WriteQuestion): boolean => {
      return !(question.answers[0].answer === "")
    },
    "checkAnswerCorrectness": (answer: WriteQuestion, original: WriteQuestion) => {
      return original.answers.map(item => item.answer.toLowerCase().replace(/\s/g, "")).includes(answer.answers[0].answer.toLowerCase().replace(/\s/g, ""))
    },
    "checkCreatorCorrectFormat": (content: WriteQuestion) => {
      let isError = false

      for (const item in content.answers) {
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    }
  },
  "fill": {
    "createNew": () => {
      return {
        type: 'fill',
        answers: [
          {
            answer: {
              options: [""],
              precedent: "",
              sequent: "",
              errors: {
                options: []
              }
            }
          }
        ]
      }
    },
    "separateAnswer": (question: FillQuestion): FillQuestion => {
      return {
        ...question,
        answers: question.answers.map(item => {
          return {
            answer: {
              options: [""],
              precedent: item.answer.precedent,
              sequent: item.answer.sequent,
              errors: {
                options: []
              }
            }
          }
        })
      }
    },
    "checkAnswerPresence": (question: FillQuestion): boolean => {
      return !(question.answers.every(item => item.answer.options[0] !== undefined))
    },
    "checkAnswerCorrectness": (answer: FillQuestion, original: FillQuestion) => {
      return original.answers.every((item, index) => item.answer.options.map(ans => ans.toLowerCase().replace(/\s/g, "")).includes(answer.answers[index].answer.options[0].toLowerCase().replace(/\s/g, "")))
    },
    "checkCreatorCorrectFormat": (content: FillQuestion) => {
      let isError = false

      for (const answer in content.answers) {
        for (const option in content.answers[answer].answer.options) {
          const result = answerSchema.safeParse(content.answers[answer].answer.options[option])
          if (result.success === false) {
            isError = true
            content.answers[answer].answer.errors.options[option] = result.error.errors[0].message
          }
        }

        const prec = answerSchema.safeParse(content.answers[answer].answer.precedent)
        const seq = answerSchema.safeParse(content.answers[answer].answer.sequent)

        if (prec.success === false) {
          isError = true
          content.answers[answer].answer.errors.precedent = prec.error.errors[0].message
        }

        if (seq.success === false) {
          isError = true
          content.answers[answer].answer.errors.sequent = seq.error.errors[0].message
        }

      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    }
  }
}

export function initializeNewTestToTestStore(testData: ClientTest) {
  testObject.set({
    title: testData.title,
    description: testData.description,
    questions: testData.questions,
    errors: testData.errors
  })
}

export function initializeTestToTestStore(testData: ExcludePick<TestFullType, "owner" | "tags" | "stars" | "views">) {
  testObject.set({
    id: testData.id,
    versionId: testData.testVersions[0].versionId,
    title: testData.testVersions[0].title,
    description: testData.testVersions[0].description,
    published: testData.published,
    errors: {},
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    questions: testData.testVersions[0].questions.map((question) => {
      return {
        id: question.id,
        title: question.title,
        content: question.content,
        questionTypeId: question.typeId,
        questionType: question.type.slug as unknown as keyof QuestionTypeMap,
        displayType: question.type.name,

        errors: {}
      }
    })
  })
}

type IsTestValid = {
  title?: string,
  description?: string,
  questions?: QuestionClient[]
}

// Check the validity of the test object on the server
export async function isValidInputServer(obj: IsTestValid): Promise<{ success: boolean, obj: IsTestValid }> {
  const res = await enviromentFetch({
    path: "validateTest",
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json"
    }
  })
  // const res = await fetch(`${dev ? "http://localhost:5173/api/validateTest" : "https://effio.vercel.app/api/validateTest"}`, {
  //   method: 'POST',
  //   body: JSON.stringify(obj),
  //   headers: {
  //     'Content-Type': 'application/json'
  //   }
  // });
  const data = (await res.json()) as { store: QuestionClient[]; error: boolean };
  obj.questions = data.store as QuestionClient[];
  return {
    success: !data.error,
    obj: obj
  };
}

const asnwerSchema = z.object({
  answer: answerObjectSchema//z.string().min(1, "Answer has to be at least 1 character long.").max(100, "Answer can be max 100 characters long.")
}).passthrough()

const questionSchema = z.object({
  title: titleSchema//z.string().min(8, "Title has to be at least 8 character long.").max(250, "Title can be max 250 characters long."),
})

// Validates if the test object is valid - meaning that all the inputs are filled and so on
// TODO: Rewrite this to use zod
export function isTestValid(inputsToValidate: IsTestValid) {

  const { title, description, questions } = inputsToValidate
  let isError = false
  let message = ""

  const result: {
    errors: {
      title?: string,
      description?: string
    };
    questions?: QuestionClient[];
  } = {
    errors: {}
  }

  const titleParse = titleSchema.safeParse(title)

  if (title !== undefined && !titleParse.success) {
    result.errors.title = titleParse.error.errors[0].message
    isError = true
  } else {
    result.errors.title = ""
  }

  const descriptionParse = descriptionSchema.safeParse(description)

  if (description !== undefined && !descriptionParse.success) {
    result.errors.description = descriptionParse.error.errors[0].message
    isError = true
  } else {
    result.errors.description = ""
  }

  if (questions) {
    if (questions.length === 0) {
      isError = true
      message = "You need to add at least one question."
    }
    else if (questions.length > QUESTION_LIMIT) {
      message = "You can't have more than " + QUESTION_LIMIT + " questions."
    }
    for (const item of questions) {

      // Checking the title of the question
      const titleResult = titleSchema.safeParse(item.title)

      if (titleResult.success === false) {
        isError = true
        item.errors.title = titleResult.error.errors[0].message
      }
      else {
        item.errors.title = ""
      }

      // Checking the content of the question
      const returnResult = questionContentFunctions[item.questionType]["checkCreatorCorrectFormat"](item.content as any)

      item.content = returnResult.store

      if (returnResult.isError) {
        isError = true
      }
    }
  }

  console.log({
    store: result,
    isError,
    message
  })

  return {
    store: result,
    isError,
    message
  }
}

// Check the test object and propagate errors if needed
export const checkTestClient = (test: TestObject) => {
  let isError = false

  for (const question of test.questions) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (!questionContentFunctions[question.questionType].checkAnswerPresence(question.content as any)) {
      question.errors.content = "Please fill in the answer."
      isError = true
    }
  }

  return {
    success: !isError,
    store: test
  }
}

type CheckServer = {
  error?: string;
  success: boolean;
  questionData?: QuestionServerCheckResponse<QuestionContent>[]



  //({ isCorrect: boolean } & { [key: string]: unknown })[]
}

// Check test on the server for correctness of the answers

export const checkTestServerAndRecordIt = async (test: TestObject): Promise<CheckServer> => {
  if (test.id === undefined || test.versionId === undefined) return {
    error: "Test has no ID and hence cannot be submitted.",
    success: false
  }

  const res = await enviromentFetch({
    path: "checkTest",
    method: "POST",
    body: JSON.stringify(test)
  })

  const responseData = await res.json() as CheckTestResponse

  if (responseData.success === undefined) throw new Error("Server error")

  if (responseData.data?.some((item) => item.isCorrect === undefined)) return {
    error: "Incorect check",
    success: false
  }

  if (responseData.data?.some((item) =>
    typeof item.correctAnswer === "undefined" ||
    typeof item.isCorrect === "undefined" ||
    typeof item.userAnswer === "undefined")) return {
      error: "Incorect inputs",
      success: false
    }

  let questionData

  try {
    questionData = responseData.data?.map(item => {
      if (item.isCorrect === undefined) throw new Error("Incorrect Input")
      if (item.correctAnswer === undefined) throw new Error("Incorrect Input")
      if (item.userAnswer === undefined) throw new Error("Incorrect Input")

      return {
        isCorrect: item.isCorrect,
        correctAnswer: item.correctAnswer,
        userAnswer: item.userAnswer,
      }
    })
  }
  catch (e) {
    return {
      error: "Incorrect inputs",
      success: false
    }
  }

  if (!questionData) return {
    error: "Incorrect inputs",
    success: false
  }

  console.log({
    testId: test.id,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    answerContent: questionData.map((item, index) => {
      return {
        questionId: test.questions[index].id,
        questionContent: {
          original: item.correctAnswer,
          user: item.userAnswer
        },
      }
    })
  })

  await trpc().records.createTestRecord.mutate({
    testId: test.versionId,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    answerContent: questionData.map((item, index) => {
      return {
        questionId: test.questions[index].id,
        userContent: item.userAnswer
      }
    })
  })

  return {
    error: responseData?.error ?? undefined,
    success: responseData?.success ?? false,
    questionData
  }
}