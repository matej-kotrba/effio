import type { TestFullType } from "~/Prisma";
import { testObject, type TestObject } from "~stores/testObject";
import { z } from "zod"
import { answerSchema as answerObjectSchema, answerSchema, descriptionSchema, GEOGRAPHY_TOLERANCE_DEFAULT, geographyLocationSchema, geographyToleranceSchema, MARK_LIMIT_MAX_MARK_COUNT, markLimitSchema, markSchema, programmingDescriptionSchema, programmingHintSchema, programmingTestInputSchema, programmingTestOutputSchema, programmingTestSchema, titleSchema } from "~schemas/textInput"
import { enviromentFetch } from "./fetch";
import type { CheckTestResponse } from "~/routes/api/checkTest/+server";
import { trpc } from "../trpc/client";
import type { Prisma, TestRecord } from "@prisma/client";
import { checkMarkSystem } from "~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte";
import { browser } from "$app/environment";
import { get } from "svelte/store";
import { validateCode } from "./validateCode";

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
  },
  "geography": {
    icon: "tabler:globe-filled"
  },
  "programming": {
    icon: "solar:programming-bold"
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
  },
  "geography": {
    createNew: () => {
      return {
        type: "geography",
        initial: {
          location: [50.143477, 14.094096],
          zoom: 6
        },
        tolerence: GEOGRAPHY_TOLERANCE_DEFAULT,
        answerPoint: {
          location: [49.937082, 17.907414]
        }
      }
    },
    separateAnswer: (question: GeographyQuestion): GeographyQuestion => {
      return {
        ...question,
        answerPoint: {
          location: question.initial.location
        }
      }
    },
    checkAnswerPresence: (question: GeographyQuestion): boolean => {
      return typeof question.answerPoint.location[0] === "number" && typeof question.answerPoint.location[1] === "number"
    },
    checkAnswerCorrectness: (answer: GeographyQuestion, original: GeographyQuestion) => {
      if (!answer.answerPoint.location || !original.answerPoint.location) return false
      const lat1 = answer.answerPoint.location[0]
      const lon1 = answer.answerPoint.location[1]
      const lat2 = original.answerPoint.location[0]
      const lon2 = original.answerPoint.location[1]

      const R = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= original.tolerence
    },
    checkCreatorCorrectFormat: (content: GeographyQuestion) => {
      let isError = false
      let message = ""

      const parsedTolerance = geographyToleranceSchema.safeParse(content.tolerence)

      if (parsedTolerance.success === false) {
        isError = true
        message = parsedTolerance.error.errors[0].message
      }

      const parsedLocation = geographyLocationSchema.safeParse(content.initial.location)

      if (parsedLocation.success === false) {
        isError = true
        message = parsedLocation.error.errors[0].message
      }

      const answerLocation = geographyLocationSchema.safeParse(content.answerPoint.location)

      if (answerLocation.success === false) {
        isError = true
        message = answerLocation.error.errors[0].message
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    },
    calculatePoints: (q1: GeographyQuestion, q2: GeographyQuestion, maxPoints: number) => {
      return questionContentFunctions["geography"].checkAnswerCorrectness(q1, q2) ? maxPoints : 0
    }
  },
  "programming": {
    "createNew": () => {
      return {
        type: 'programming',
        description: '',
        code: '',
        language: 'js',
        tests: [
          {
            input: '',
            output: '',
            error: ''
          }
        ],
        hints: [],
        errors: {}
      }
    },
    "separateAnswer": (question: ProgrammingQuestion): PartialPick<ProgrammingQuestion, "code"> => {
      return {
        ...question,
        code: ""
      }
    },
    "checkAnswerPresence": (question: ProgrammingQuestion): boolean => {
      return true
    },
    "checkAnswerCorrectness": (answer: ProgrammingQuestion, original: ProgrammingQuestion) => {
      const data = validateCode(answer.code, original.tests)
      if (!data) return false
      const isAllRight = data.testPasses.find(item => item === false) === undefined
      if (isAllRight) return true
      const isAnyRight = data.testPasses.find(item => item === true) !== undefined
      if (isAnyRight) return "partial"
      return false
    },
    "checkCreatorCorrectFormat": (content: ProgrammingQuestion) => {
      let isError = false
      let message = ""

      if (!content.language) {
        isError = true
        message = "Please select the language."
      }

      if (!content.description) {
        isError = true

        const parsedDescription = programmingDescriptionSchema.safeParse(content.description)
        if (parsedDescription.success === false) {
          isError = true
          content.errors.description = parsedDescription.error.errors[0].message
        }
      }

      if (content.tests === undefined) {
        isError = true
        message = "Please add the tests."
      }
      else {
        for (const i in content.tests) {
          const input = programmingTestInputSchema.safeParse(content.tests[i].input)

          if (input.success === false) {
            isError = true
            if (content.errors.tests === undefined) content.errors.tests = []
            if (content.errors.tests[i] === undefined) content.errors.tests[i] = {}
            content.errors.tests[i].input = input.error.errors[0].message
          }

          const output = programmingTestOutputSchema.safeParse(content.tests[i].output)

          if (output.success === false) {
            isError = true
            if (content.errors.tests === undefined) content.errors.tests = []
            if (content.errors.tests[i] === undefined) content.errors.tests[i] = {}
            content.errors.tests[i].output = output.error.errors[0].message
          }
        }
      }

      for (const i in content.hints) {
        const hint = programmingHintSchema.safeParse(content.hints[i])

        if (hint.success === false) {
          isError = true
          if (content.errors.hints === undefined) content.errors.hints = []
          content.errors.hints[i] = hint.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    },
    "calculatePoints": (q1: ProgrammingQuestion, q2: ProgrammingQuestion, maxPoints: number) => {
      return questionContentFunctions["programming"]["checkAnswerCorrectness"](q1, q2) ? maxPoints : 0
    }
  }
}

export function initializeNewTestToTestStore(testData: ClientTest) {
  testObject.set({
    title: testData.title,
    description: testData.description,
    questions: testData.questions,
    errors: testData.errors,
    markSystem: {},
    tagIds: [],
  })
}

// TODO: FIX THE TYPES

export function initializeTestToTestStore(testData: ExcludePick<TestFullType, "owner" | "stars" | "views">) {
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
    tagIds: testData.tags.map(item => item.tagId),
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

export type IsTestValidProps = {
  title?: string
  description?: string
  questions?: QuestionClient[]
  markSystem?: MarkSystemJSON
  tagIds?: string[]
}

export type IsTestValidResponse = {
  store: {
    errors: {
      title?: string,
      description?: string;
      markSystem?: ClientTest["errors"]["markSystem"]
      tagIds?: ClientTest["errors"]["tagIds"]
    };
    inputsToValidateUpdatedParts: Pick<IsTestValidProps, "questions">
  };
  isError: boolean;
  message?: string;
}

// TODO: Return actuall errors from the server and set them to the test object from isTestValidAndSetErrorsToTestObject function
// Check the validity of the test object on the server
export async function isValidInputServerAndSetErrorsToTestObject(obj: IsTestValidProps): Promise<IsTestValidResponse> {
  // console.log("SERVER VALIDATION", obj)
  const res = await enviromentFetch({
    path: "validateTest",
    method: "POST",
    body: JSON.stringify(obj),
    headers: {
      "Content-Type": "application/json"
    }
  })

  const data = (await res.json()) as ReturnType<typeof isTestValidAndSetErrorsToTestObject>;

  // If the function is called in the browser then set all the errors to the test object
  // Maybe currentTestObject.errors.title should be swaped for currentTestObject.title and so on, not sure now
  if (browser) {
    const currentTestObject = get(testObject)
    if (data.store.inputsToValidateUpdatedParts.questions !== undefined) {
      currentTestObject.questions = data.store.inputsToValidateUpdatedParts.questions
    }
    if (data.store.errors.title !== undefined) {
      currentTestObject.errors.title = data.store.errors.title
    }
    if (data.store.errors.description !== undefined) {
      currentTestObject.errors.description = data.store.errors.description
    }
    if (data.store.errors.markSystem !== undefined) {
      currentTestObject.errors.markSystem = { marks: [] }
      currentTestObject.errors.markSystem.marks = data.store.errors.markSystem.marks
      currentTestObject.errors.markSystem.message = data.store.errors.markSystem.message
    }
    if (data.store.errors.tagIds !== undefined) {
      currentTestObject.errors.tagIds = data.store.errors.tagIds
    }
    testObject.set(
      currentTestObject
    )
  }
  return {
    isError: data.isError,
    store: data.store,
    message: data.message
  };
}

// Validates if the test object is valid - meaning that all the inputs are filled and so on
export function isTestValidAndSetErrorsToTestObject(inputsToValidate: IsTestValidProps): IsTestValidResponse {

  const { title, description, questions, markSystem } = inputsToValidate
  let isError = false
  let message = ""

  // TODO: Maybe return whole inputsToValidate because now errors are set here in question specific functions but on server it would not work,
  // so we could return all data which then got returned in the isValidInputServer function and set it there to testObject
  const result: {
    errors: IsTestValidResponse["store"]["errors"];
    inputsToValidateUpdatedParts: IsTestValidResponse["store"]["inputsToValidateUpdatedParts"];
    // questions_errors: QuestionClient["errors"][];
  } = {
    errors: {},
    inputsToValidateUpdatedParts: {
      questions: []
    }
    // questions_errors: []
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

      // Setting errors from the check function to test object
      item.content = returnResult.store
      // Global error of the specific question
      item.errors.global = returnResult.message

      // TODO: The proccess description:
      // We call the checkCreatorCorrectFormat function which returns the object with isError and message but also with a store object
      // which includes all the errors that were found, up here we set them to testObject store via item.content reference

      // @ts-expect-error we know that the function got correct type but we cant prove that to TS
      result["inputsToValidateUpdatedParts"].questions?.push({
        ...item,
        content: returnResult.store
      })

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

  if (inputsToValidate.tagIds !== undefined) {
    for (const i in inputsToValidate.tagIds) {
      const parsedTagId = z.string().safeParse(inputsToValidate.tagIds[i])
      if (parsedTagId.success === false) {
        isError = true
        if (result.errors.tagIds === undefined) {
          result.errors.tagIds = []
        }
        result.errors.tagIds[i] = parsedTagId.error.errors[0].message
      }
    }
  }

  // Check if error is true and message is not set, if so we set message to "Some inputs are incorrect", on client then navigate to them
  // It means that every error which does not have anything to do with inputs should set a message so it makes sense
  if (isError && message === "") {
    message = "Some inputs are incorrect."
  }

  // console.log({
  //   store: result,
  //   isError,
  //   message
  // })

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
  // console.log(responseData)

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
        id: item.questionRecordId
      }
    })
  }

  catch (e) {
    return {
      error: "Incorrect inputs",
      success: false
    }
  }

  // TODO: Currently working with ids and ordering, maybe find out better solution

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
        questionRecordId: item.id,
        questionId: test.questions[index].id,
        userContent: item.userAnswer,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        points: questionContentFunctions[test.questions[index].questionType].calculatePoints(item.correctAnswer, item.userAnswer, test.questions[index].points)
      }
    })
  })

  if (!recordedTest || !recordedTest.test?.questionRecords) return {
    success: false
  }

  // TODO: Like really try to think this through

  const shuffledArray = []
  for (const i in questionData) {
    for (const k in recordedTest.test.questionRecords) {
      if (recordedTest.test.questionRecords[k].id === questionData[i].id) {
        shuffledArray.push(recordedTest.test.questionRecords[k])
        break;
      }
    }
  }

  recordedTest.test.questionRecords = shuffledArray

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
    const mark = marks[i]
    if (mark.limit === undefined) continue
    if (percentigeValue >= mark.limit) return mark
  }

  return marks[marks.length - 1]
}