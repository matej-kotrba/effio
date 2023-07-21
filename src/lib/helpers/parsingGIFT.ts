import type { GIFTQuestion } from "gift-pegjs"
import type { QuestionTemplate } from "../trpc/router"

const allowedTypes = ["MC"] as const

export function transformParsedJSONIntoEffioObject(data: GIFTQuestion[], questionTemplates: QuestionTemplate[]) {
  const resultObject: QuestionClient[] = data.filter(item => allowedTypes.includes(item.type)).map((question) => {
    try {

      if (question.type === "MC") {

        const hasMoreCorrectAnswers = question.choices.reduce((acc, item,) => {
          if (item.isCorrect || item.weight !== undefined) return acc + 1
          return acc
        }, 0)

        // Has more correct asnwers -> True/False
        if (hasMoreCorrectAnswers === 0 || hasMoreCorrectAnswers >= 2) {
          const template = questionTemplates.find(item => item.slug === "true/false")
          if (!template) throw new Error("Template not found")

          return {
            id: crypto.randomUUID(),
            questionType: "true/false",
            questionTypeId: template.id,
            title: question.title,
            errors: {},
            displayType: template.name,
            content: {
              type: "true/false",
              answers: question.choices.map(item => {

                let resultText = item.text.text

                if (item.text.format === "html") {
                  resultText = resultText.replaceAll(/<[^>]+>/g, '')
                }

                else if (item.text.format !== "plain") throw new Error("Unsupported txt format")

                return {
                  answer: resultText,
                  isTrue: item.isCorrect || item.weight !== undefined
                }
              })
            }
          } as QuestionClient
        }

        // Has only one correct answer -> Pick One
        if (hasMoreCorrectAnswers === 1) {
          const template = questionTemplates.find(item => item.slug === "pickOne")
          if (!template) throw new Error("Template not found")

          return {
            id: crypto.randomUUID(),
            questionType: "pickOne",
            questionTypeId: template.id,
            title: question.title,
            errors: {},
            displayType: template.name,
            content: {
              type: "pickOne",
              answers: question.choices.map(item => {

                let resultText = item.text.text

                if (item.text.format === "html") {
                  resultText = resultText.replaceAll(/<[^>]+>/g, '')
                }

                return {
                  answer: resultText,
                  isTrue: item.isCorrect || item.weight !== undefined
                }
              }),
              correctAnswerIndex: question.choices.findIndex(item => item.isCorrect || item.weight !== undefined)
            }
          } as QuestionClient
        }
      }

    } catch (e) {
      console.log(e)
      return []
    }
  }) as QuestionClient[]

  return resultObject
}