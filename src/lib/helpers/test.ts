import type { TestFullType } from "~/Prisma";
import { testObject, type TestObject } from "~stores/testObject";
import { dev } from "$app/environment"
import { z, ZodError } from "zod"
import { asnwerSchema as answerObjectSchema, descriptionSchema, titleSchema } from "~schemas/textInput"


type QuestionContentTransformation = {
  [Key in keyof QuestionTypeMap]: {
    // Type which takes the question and creates a question without the answer input
    // (PickOne without answer in answers array ...)
    "separateAnswer": (question: QuestionTypeMap[Key]) => object,

    // Type which takes the question and checks if the answer of the specific question type is present
    "checkAnswerPresence": (question: QuestionTypeMap[Key]) => boolean
  }
}

// Transform the question into data which will not contain answers
export const questionContentFunctions: QuestionContentTransformation = {
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

export function initializeNewTestToTestStore(testData: ClientTest) {
  testObject.set({
    title: testData.title,
    description: testData.description,
    questions: testData.questions,
    errors: testData.errors
  })
}

export function initializeTestToTestStore(testData: Omit<TestFullType, "owner" | "tags">) {
  testObject.set({
    id: testData.id,
    title: testData.title,
    description: testData.description,
    published: testData.published,
    errors: {},
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    questions: testData.questions.map((question) => {
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

export async function isValidatInputServer(obj: TestObject): Promise<{ success: boolean, obj: TestObject }> {
  const res = await fetch(`${dev ? "http://localhost:5173/api/validateTest" : "https://effio.vercel.app/api/validateTest"}`, {
    method: 'POST',
    body: JSON.stringify(obj),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = (await res.json()) as { store: Question[]; error: boolean };
  obj.questions = data.store as Question[];
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

type IsTestValid = {
  title?: string,
  description?: string,
  questions?: Question[]
}

export function isTestValid(inputsToValidate: IsTestValid) {

  const { title, description, questions } = inputsToValidate
  let isError = false

  const result: {
    errors: {
      title?: string,
      description?: string
    };
    questions?: Question[];
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
    }
    for (const item of questions) {

      try {
        questionSchema.parse(item)
        item.errors = {}
      }
      catch (e) {
        const error = e as ZodError<typeof asnwerSchema>
        item.errors.title = error.errors[0].message
        isError = true
      }

      if (item.content && item.content.answers) {
        for (const asnwer of item.content.answers)
          try {
            asnwerSchema.parse(asnwer)
            asnwer.error = ""
          }
          catch (e: unknown) {
            const error = e as ZodError<typeof asnwerSchema>
            asnwer.error = error.errors[0].message
            isError = true
          }
      }
    }
  }

  return {
    store: result,
    isError
  }
}

type CheckServer = {
  error?: string
}

export const checkTestServer = (test: TestObject): CheckServer => {
  if (!test.id) return {
    error: "Test has no ID and hence cannot be saved."
  }

  return {
    error: undefined
  }
}