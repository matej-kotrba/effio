import type { TestFullType } from "~/Prisma";
import { testObject, type TestObject } from "~stores/testObject";
import { z } from "zod"
import { answerSchema as answerObjectSchema, answerSchema, descriptionSchema, MARK_LIMIT_MAX_MARK_COUNT, markLimitSchema, markSchema, titleSchema } from "~schemas/textInput"
import { enviromentFetch } from "./fetch";
import type { CheckTestResponse } from "~/routes/api/checkTest/+server";
import { trpc } from "../trpc/client";
import type { Prisma, TestRecord } from "@prisma/client";
import { checkMarkSystem } from "~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte";

type QuestionMethods = {
  [Key in keyof QuestionTypeMap]: {
    icon: string
  }
}

export const questionMethods: QuestionMethods = {
  "pickOne": {
    icon: "fa-solid:hand-point-right"
  },
  "true/false": {
    icon: "tabler:checkbox"
  },
  "connect": {
    icon: "carbon:connect"
  },
  "write": {
    icon: "majesticons:text"
  },
  "fill": {
    icon: "fluent:text-16-filled"
  }
}

type QuestionContentTransformation = {
  [Key in keyof QuestionTypeMap]: {
    // Creates new blank question of the specific type
    "createNew": () => QuestionTypeMap[Key],

    // Type which takes the question and creates a question without the answer input
    // (PickOne without answer in answers array ...)
    "separateAnswer": (question: QuestionTypeMap[Key]) => object,

    // Type which takes the question and checks if the answer of the specific question type is present
    "checkAnswerPresence": (question: QuestionTypeMap[Key]) => boolean,
    "checkAnswerCorrectness": (q1: QuestionTypeMap[Key], q2: QuestionTypeMap[Key]) => QuestionServerCheckResponse<any>["isCorrect"],
    "checkCreatorCorrectFormat": (content: QuestionTypeMap[Key]) => { isError: boolean, message: string, store: QuestionTypeMap[Key] },
    "calculatePoints": (q1: QuestionTypeMap[Key], q2: QuestionTypeMap[Key], maxPoints: number) => number
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
    },
    "calculatePoints": (q1: PickOneQuestion, q2: PickOneQuestion, maxPoints: number) => {
      return q1.correctAnswerIndex === q2.correctAnswerIndex ? maxPoints : 0
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
      const correctAnswersCount = answer.answers.reduce((count, item, index) => item.isTrue === original.answers[index].isTrue ? count + 1 : count, 0)
      if (correctAnswersCount === answer.answers.length) return true
      if (correctAnswersCount === 0) return false
      return "partial"
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
    },
    "calculatePoints": (q1: TrueFalseQuestion, q2: TrueFalseQuestion, maxPoints: number) => {
      const correctAnswersCount = q1.answers.reduce((count, item, index) => item.isTrue === q2.answers[index].isTrue ? count + 1 : count, 0)
      return +(correctAnswersCount / q1.answers.length * maxPoints).toFixed(2)
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
      let correctAnswersCount = 0
      for (const i in answer.answers) {
        if (answer.answers[i].matchedAnswerIndex === original.answers[i].matchedAnswerIndex) {
          correctAnswersCount++
        }
      }
      if (correctAnswersCount === answer.answers.length) return true
      else if (correctAnswersCount === 0) return false
      return "partial"
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
    },
    "calculatePoints": (q1: ConnectQuestion, q2: ConnectQuestion, maxPoints: number) => {
      const correctAnswersCount = q1.answers.reduce((count, item, index) => item.matchedAnswerIndex === q2.answers[index].matchedAnswerIndex ? count + 1 : count, 0)
      return +(correctAnswersCount / q1.answers.length * maxPoints).toFixed(2)
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
    },
    "calculatePoints": (q1: WriteQuestion, q2: WriteQuestion, maxPoints: number) => {
      return q1.answers.map(item => item.answer.toLowerCase().replace(/\s/g, "")).includes(q2.answers[0].answer.toLowerCase().replace(/\s/g, "")) ? maxPoints : 0
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
      return question.answers.every(item => item.answer.options[0] !== "")
    },
    "checkAnswerCorrectness": (answer: FillQuestion, original: FillQuestion) => {
      const correctAnswersCount = original.answers.reduce((count, item, index) => item.answer.options.map(ans => ans.toLowerCase().replace(/\s/g, "")).includes(answer.answers[index].answer.options[0].toLowerCase().replace(/\s/g, "")) ? count + 1 : count, 0)
      if (correctAnswersCount === answer.answers.length) return true
      if (correctAnswersCount === 0) return false
      return "partial"
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
    },
    "calculatePoints": (q1: FillQuestion, q2: FillQuestion, maxPoints: number) => {
      const correctAnswersCount = q1.answers.reduce((count, item, index) => item.answer.options.map(ans => ans.toLowerCase().replace(/\s/g, "")).includes(q2.answers[index].answer.options[0].toLowerCase().replace(/\s/g, "")) ? count + 1 : count, 0)
      return +(correctAnswersCount / q1.answers.length * maxPoints).toFixed(2)
    }
  }
}

export function initializeNewTestToTestStore(testData: ClientTest) {
  testObject.set({
    title: testData.title,
    description: testData.description,
    questions: testData.questions,
    errors: testData.errors,
    markSystem: {}
  })
}

// TODO: FIX THE TYPES

export function initializeTestToTestStore(testData: ExcludePick<TestFullType, "owner" | "tags" | "stars" | "views">) {
  const markSystem = checkMarkSystem(testData.testVersions[0].markSystemJSON)
  testObject.set({
    id: testData.id,
    versionId: testData.testVersions[0].versionId,
    title: testData.title,
    description: testData.description,
    published: testData.published,
    markSystem: markSystem ? {
      marks: markSystem
    } : {},
    errors: {},
    questions: testData.testVersions[0].questions.map((question) => {
      const type = question.type.slug as keyof QuestionTypeMap
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const item: QuestionClient = {
        id: question.id,
        title: question.title,
        content: question.content as QuestionTypeMap[typeof type],
        questionTypeId: question.typeId,
        questionType: type,
        displayType: question.type.name,
        points: question.points,
        errors: {}
      }
      return item
    })
  })
}

type IsTestValid = {
  title?: string,
  description?: string,
  questions?: QuestionClient[]
  markSystem?: MarkSystemJSON
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
  // TODO: PLEASE rewrite this so it makes a little sence

  const data = (await res.json()) as { store: QuestionClient[]; error: boolean };
  obj.questions = data.store as QuestionClient[];
  return {
    success: !data.error,
    obj: obj
  };
}

// Validates if the test object is valid - meaning that all the inputs are filled and so on
// TODO: Rewrite this to use zod
export function isTestValid(inputsToValidate: IsTestValid) {

  const { title, description, questions, markSystem } = inputsToValidate
  let isError = false
  let message = ""

  const result: {
    errors: {
      title?: string,
      description?: string;
      markSystem?: ClientTest["errors"]["markSystem"]
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

  if (markSystem !== undefined && markSystem.marks) {
    result.errors.markSystem = {
      marks: []
    }
    for (const i in markSystem.marks) {
      const parsedName = markSchema.safeParse(markSystem.marks[i].name)
      if (parsedName.success === false) {
        isError = true
        if (result.errors.markSystem.marks[i] === undefined) {
          result.errors.markSystem.marks[i] = {}
        }
        result.errors.markSystem.marks[i]["name"] = parsedName.error.errors[0].message
      }
      if (markSystem.marks.length > MARK_LIMIT_MAX_MARK_COUNT) {
        isError = true
        result.errors.markSystem.message = "You can't have more than " + MARK_LIMIT_MAX_MARK_COUNT + " marks."
      }

      const parsedLimit = markLimitSchema.safeParse(markSystem.marks[i].limit)
      if (parsedLimit.success === false) {
        isError = true
        if (result.errors.markSystem.marks[i] === undefined) {
          result.errors.markSystem.marks[i] = {}
        }
        result.errors.markSystem.marks[i]["limit"] = parsedLimit.error.errors[0].message
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
  test?: TestRecord & Prisma.TestRecordGetPayload<{
    include: {
      questionRecords: true
    }
  }>

  //({ isCorrect: boolean } & { [key: string]: unknown })[]
}

// Check test on the server for correctness of the answers

export const checkTestServerAndRecordIt = async (test: TestObject, subcategoryId?: string): Promise<CheckServer> => {
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

  const recordedTest = await trpc().records.createTestRecord.mutate({
    testId: test.versionId,
    title: test.title,
    description: test.description,
    subcategoryId: subcategoryId,
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    answerContent: questionData.map((item, index) => {
      return {
        questionId: test.questions[index].id,
        userContent: item.userAnswer,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        points: questionContentFunctions[test.questions[index].questionType].calculatePoints(item.correctAnswer, item.userAnswer, test.questions[index].points)
      }
    })
  })

  return {
    error: responseData?.error ?? undefined,
    success: responseData?.success ?? false,
    questionData,
    test: recordedTest.test ?? undefined
  }
}


// Returns corresponding mark for the test based on points
export function getMarkBasedOnPoints(marks: MarkSystemJSON["marks"], userPoints: number, maxPoints: number) {
  const percentigeValue = userPoints / maxPoints * 100

  for (let i = 0; i < marks.length - 1; i++) {
    console.log(i)
    const mark = marks[i]
    if (mark.limit === undefined) continue
    if (percentigeValue >= mark.limit) return mark
  }

  return marks[marks.length - 1]
}