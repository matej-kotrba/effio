import type { GIFTQuestion } from "gift-pegjs"
import type { QuestionTemplate } from "../trpc/router"

const allowedTypes: GIFTQuestion["type"][] = ["MC", "Matching", "Short"]

export function transformParsedJSONIntoEffioObject(data: GIFTQuestion[], questionTemplates: QuestionTemplate[]) {
  const result = data.filter(item => allowedTypes.includes(item.type)).map((question) => {
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
          }
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
          }
        }
      }

      else if (question.type === "Matching") {
        const template = questionTemplates.find(item => item.slug === "connect")
        if (!template) throw new Error("Template not found")

        const matchedPairs = Object.fromEntries(question.matchPairs.map(item => {
          return [crypto.randomUUID(), {
            answer: item.subanswer
          }]
        }))

        return {
          id: crypto.randomUUID(),
          title: question.title,
          questionType: "connect",
          questionTypeId: template.id,
          displayType: template.name,
          errors: {},
          content: {
            type: "connect",
            matchedAnswers: matchedPairs,
            answers: question.matchPairs.map(item => {
              return {
                answer: item.subquestion.text,
                matchedAnswerIndex: Object.entries(matchedPairs).find((entry) => {
                  return entry[1].answer === item.subanswer
                })?.[0]
              }
            })
          }
        } as QuestionClient
      }

      else if (question.type === "Short") {
        const template = questionTemplates.find(item => item.slug === "write")
        if (!template) throw new Error("Template not found")

        return {
          id: crypto.randomUUID(),
          title: question.title,
          questionType: "write",
          questionTypeId: template.id,
          displayType: template.name,
          errors: {},
          content: {
            type: "write",
            answers: question.choices.map(item => {

              let resultText = item.text.text

              if (item.text.format === "html") {
                resultText = resultText.replaceAll(/<[^>]+>/g, '')
              }

              return {
                answer: resultText,
              }
            })
          }
        } as QuestionClient
      }

    } catch (e) {
      console.log(e)
    }
  })

  const filtered = result.filter(item => item !== undefined)

  const resultArray: QuestionClient[] = (filtered.length !== 0 ? result : []) as QuestionClient[]

  return resultArray
}