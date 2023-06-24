import type { TestFullType } from "~/Prisma";
import { testObject } from "~stores/testObject";

export function initializeTestToTestStore(testData: Omit<TestFullType, "owner" | "tags">) {
  testObject.set({
    title: testData.title,
    description: testData.description,
    questions: testData.questions.map((question) => {
      return {
        id: question.id,
        title: question.title,
        content: question.content,
        questionTypeId: question.typeId,
        questionType: question.type.slug as keyof QuestionTypeMap,
        displayType: question.type.name,

        errors: {}
      }
    })
  })
}