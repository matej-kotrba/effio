import type { TestFullType } from "~/Prisma";
import { testObject, type TestObject } from "~stores/testObject";
import { dev } from "$app/environment"

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

export async function isValidatInputServer(obj: TestObject): Promise<{ success: boolean, obj: TestObject }> {
  const res = await fetch(`${dev ? "http://localhost:5173/api/validateTest" : "https://effio.vercel.app/api/validateTest"}`, {
    method: 'POST',
    body: JSON.stringify(obj.questions),
    headers: {
      'Content-Type': 'application/json'
    }
  });
  const data = (await res.json()) as { store: Question[]; error: boolean };
  obj.questions = data.store as Question[];
  console.log(data.store);
  return {
    success: !data.error,
    obj: obj
  };
}