import type { GIFTQuestion, TextFormat } from "gift-pegjs"
import type { QuestionTemplate } from "../trpc/router"
import { POINTS_PER_QUESTION_DEFAULT } from "~schemas/testValidation"

const allowedTypes: GIFTQuestion["type"][] = ["MC", "Matching", "Short"]

function removePartsOfString(input: string, type: TextFormat["format"]): string {
  if (type === "plain") {
    return input
  }
  else if (type === "html") {
    return input.replaceAll(/<[^>]+>/g, '')
  }
  else if (type === "moodle") {
    return input.replaceAll(/%[0-9]*%\[[a-z]*\]/g, '')
  }
  return input
}

export function transformParsedJSONIntoEffioObject(data: GIFTQuestion[], questionTemplates: QuestionTemplate[]) {
  const result: (QuestionClient | undefined)[] = data.filter(item => allowedTypes.includes(item.type)).map((question) => {
    // console.log(question)
    try {

      if (question.type === "MC") {

        const hasMoreCorrectAnswers = question.choices.reduce((acc, item,) => {
          if (item.isCorrect || item.weight) return acc + 1
          return acc
        }, 0)

        // console.log(hasMoreCorrectAnswers)
        // Has more correct asnwers -> True/False
        if (hasMoreCorrectAnswers === 0 || hasMoreCorrectAnswers >= 2) {
          const template = questionTemplates.find(item => item.slug === "trueFalse")
          if (!template) throw new Error("Template not found")

          return {
            id: crypto.randomUUID(),
            questionType: "trueFalse",
            questionTypeId: template.id,
            title: question.title ?? "",
            errors: {},
            displayType: template.name,
            points: POINTS_PER_QUESTION_DEFAULT,
            content: {
              type: "trueFalse",
              answers: question.choices.map((item, index) => {

                return {
                  id: index,
                  answer: removePartsOfString(item.text.text, item.text.format),
                  isTrue: item.isCorrect || !!item.weight
                }
              })
            } satisfies TrueFalseQuestion
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
            title: question.title ?? "",
            errors: {},
            displayType: template.name,
            points: POINTS_PER_QUESTION_DEFAULT,
            content: {
              type: "pickOne",
              answers: question.choices.map((item, index) => {
                return {
                  id: index,
                  answer: removePartsOfString(item.text.text, item.text.format),
                  // isTrue: item.isCorrect || item.weight !== undefined
                }
              }),
              correctAnswerId: question.choices.findIndex(item => item.isCorrect || item.weight !== undefined)
            } satisfies PickOneQuestion
          }
        }
      }

      else if (question.type === "Matching") {
        const template = questionTemplates.find(item => item.slug === "connect")
        if (!template) throw new Error("Template not found")

        const matchedPairs = Object.fromEntries(question.matchPairs.map((item, index) => {
          return [crypto.randomUUID(), {
            displayId: index,
            answer: item.subanswer,
          }]
        })) satisfies ConnectQuestion["matchedAnswers"]

        return {
          id: crypto.randomUUID(),
          title: question.title,
          questionType: "connect",
          questionTypeId: template.id,
          displayType: template.name,
          points: POINTS_PER_QUESTION_DEFAULT,
          errors: {},
          content: {
            type: "connect",
            matchedAnswers: matchedPairs,
            answers: question.matchPairs.map((item, index) => {
              console.log(item)
              return {
                id: index,
                answer: removePartsOfString(item.subquestion.text, item.subquestion.format),
                matchedAnswerIndex: Object.entries(matchedPairs).find((entry) => {
                  return entry[1].answer === item.subanswer
                })?.[0]
              }
            })
          } satisfies ConnectQuestion
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
          points: POINTS_PER_QUESTION_DEFAULT,
          errors: {},
          content: {
            type: "write",
            answers: question.choices.map(item => {
              return {
                answer: removePartsOfString(item.text.text, item.text.format),
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

  const resultArray: QuestionClient[] = (filtered.length !== 0 ? filtered : [])

  return resultArray
}