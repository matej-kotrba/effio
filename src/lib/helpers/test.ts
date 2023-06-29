import type { TestFullType } from "~/Prisma";
import { testObject, type TestObject } from "~stores/testObject";
import { dev } from "$app/environment"
import { z, ZodError } from "zod"
import { asnwerSchema as answerObjectSchema, titleSchema } from "~schemas/textInput"

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

// TODO: Complete validation here or leave at the API endpoint

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

  if (title && !titleParse.success) {
    result.errors.title = titleParse.error.message
    isError = true
  } else {
    result.errors.title = ""
  }

  const descriptionParse = titleSchema.safeParse(description)

  if (description && !descriptionParse.success) {
    result.errors.description = descriptionParse.error.message
    isError = true
  } else {
    result.errors.description = ""
  }

  if (questions) {
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


  // const body = (await event.request.json()) as TestObject

  // const questions = body.questions

  // let isError = false

  // for (const item of questions) {

  //   try {
  //     questionSchema.parse(item)
  //     item.errors = {}
  //   }
  //   catch (e) {
  //     const error = e as ZodError<typeof asnwerSchema>
  //     item.errors.title = error.errors[0].message
  //     isError = true
  //   }

  //   if (item.content && item.content.answers) {
  //     for (const asnwer of item.content.answers)
  //       try {
  //         asnwerSchema.parse(asnwer)
  //         asnwer.error = ""
  //       }
  //       catch (e: unknown) {
  //         const error = e as ZodError<typeof asnwerSchema>
  //         asnwer.error = error.errors[0].message
  //         isError = true
  //       }
  //   }
  // }

  // const titleParse = titleSchema.safeParse(body.title)
  // if (!titleParse.success) {
  //   body.errors.title = titleParse.error.message
  // }

  // const descriptionParse = titleSchema.safeParse(body.description)
  // if (!descriptionParse.success) {
  //   body.errors.description = descriptionParse.error.message
  // }

  // return json({ store: questions, error: isError }) 
}