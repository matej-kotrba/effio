import type { GIFTQuestion } from "gift-pegjs"

const allowedTypes = ["MC"] as const

type AllowedTypesType = typeof allowedTypes[number]

export function transformParsedJSONIntoEffioObject(data: GIFTQuestion[]) {
  // const resultObject: QuestionClient[] = data.map((question) => {

  //   if (question.type === "MC") {
  //     return
  //   }

  //   return
  // })
}