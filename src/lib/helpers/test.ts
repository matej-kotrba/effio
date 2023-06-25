import type { TestFullType } from "~/Prisma";
import { testObject } from "~stores/testObject";

export function initializeNewTestToTestStore(testData: ClientTest) {
  testObject.set({
    title: testData.title,
    description: testData.description,
    questions: testData.questions
  })
}

export function initializeTestToTestStore(testData: Omit<TestFullType, "owner" | "tags">) {
  testObject.set({
    id: testData.id,
    title: testData.title,
    description: testData.description,
    published: testData.published,
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