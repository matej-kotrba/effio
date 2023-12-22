import type { TestWithQuestionsAndVersions } from "~/Prisma"
import { questionContentFunctions } from "~helpers/test/questionFunctions"

export function transformTestToTakeFormat(test: TestWithQuestionsAndVersions) {
  const questionTypeOptions = Object.keys(questionContentFunctions)

  let editedQuestions = test.testVersions[0].questions.map((question) => {
    // check if the question type exists in the object above, if so then redirect to homepage
    if (!questionTypeOptions.some((key) => key === question.type.slug)) throw new Error("Invalid question type")
    const separatedContent = questionContentFunctions[question.type.slug as keyof QuestionTypeMap]["separateAnswer"](question.content as any)
    return {
      ...question,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      content: questionContentFunctions[question.type.slug as keyof QuestionTypeMap]["shuffleAnswers"](separatedContent)
    }
  })

  if (test.randomQuestionOrder) {
    editedQuestions = editedQuestions.map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value)
  }

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  test.testVersions[0].questions = editedQuestions

  return test
}