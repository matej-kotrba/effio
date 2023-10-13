import type { TestFullType } from "~/Prisma"
import { questionContentFunctions } from "~helpers/test"

export function transformTestToTakeFormat(test: TestFullType) {
  const questionTypeOptions = Object.keys(questionContentFunctions)

  const editedQuestions = test.testVersions[0].questions.map((question) => {
    // check if the question type exists in the object above, if so then redirect to homepage
    if (!questionTypeOptions.some((key) => key === question.type.slug)) throw new Error("Invalid question type")
    return {
      ...question,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      content: questionContentFunctions[question.type.slug as keyof QuestionTransformation]["separateAnswer"](question.content)
    }
  })

  test.testVersions[0].questions = editedQuestions

  return test
}