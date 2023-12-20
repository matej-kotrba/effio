import type { TestFullType } from "~/Prisma";
import { testObject, type TestObject } from "~stores/testObject";
import { z } from "zod"
import { descriptionSchema, MARK_LIMIT_MAX_MARK_COUNT, markLimitSchema, markSchema, titleSchema } from "~schemas/textInput"
import { enviromentFetch } from "../fetch";
import type { CheckTestResponse } from "~/routes/api/checkTest/+server";
import { trpc } from "../../trpc/client";
import type { Prisma, TestRecord } from "@prisma/client";
import { checkMarkSystem } from "~/routes/dashboard/(paddingApplied)/test-history/records/[id]/+page.svelte";
import { browser } from "$app/environment";
import { get } from "svelte/store";
import { QUESTION_LIMIT, questionContentFunctions } from "./questionFunctions";

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

export function initializeTestToTestStore(testData: ExcludePick<TestFullType, "owner" | "views">) {
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