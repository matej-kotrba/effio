import { ALLOWED_IMAGE_TYPES, IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB } from "~helpers/constants"
import { enviromentFetch } from "~helpers/fetch"
import { validateCode } from "~helpers/validateCode"
import { answerSchema, GEOGRAPHY_TOLERANCE_DEFAULT, geographyToleranceSchema, geographyLocationSchema, programmingDescriptionSchema, programmingTestInputSchema, programmingTestOutputSchema, programmingHintSchema, BITMAP_ZOOM_MIN, bitmapToleranceSchema, bitmapLocationSchema } from "~schemas/testValidation"

type QuestionConstants = {
  [Key in keyof QuestionTypeMap]: {
    icon: string
  }
}

export const questionConstants: QuestionConstants = {
  "pickOne": {
    icon: "fa-solid:hand-point-right"
  },
  "trueFalse": {
    icon: "tabler:checkbox"
  },
  "connect": {
    icon: "carbon:connect"
  },
  "write": {
    icon: "majesticons:text"
  },
  "fill": {
    icon: "fluent:text-16-filled"
  },
  "geography": {
    icon: "tabler:globe-filled"
  },
  "programming": {
    icon: "solar:programming-bold"
  },
  "image": {
    icon: "clarity:image-line"
  },
  "bitmap": {
    icon: "bi:map"
  }
}

type FillAdditionalMethods = {
  "checkOptionCorrectness": (option: FillQuestion["answers"][number]["answer"]["options"][number], correctOptions: FillQuestion["answers"][number]["answer"]["options"]) => boolean
}

type AdditionalMethods = {
  "fill": FillAdditionalMethods,
  [key: string]: Record<string, unknown>
}

type QuestionContentTransformation = {
  [Key in keyof QuestionTypeMap]: {
    // Creates new blank question of the specific type
    "createNew": () => QuestionTypeMap[Key],

    // Type which takes the question and creates a question without the answer input
    // (PickOne without answer in answers array ...)
    "separateAnswer": (question: QuestionTypeMap[Key]) => object,

    // Type which takes the question and checks if the answer of the specific question type is present
    "checkAnswerPresence": (question: QuestionTypeMap[Key]) => boolean,
    "checkAnswerCorrectness": (q1: QuestionTypeMap[Key], q2: QuestionTypeMap[Key]) => QuestionServerCheckResponse<any>["isCorrect"],
    "checkCreatorCorrectFormat": (content: QuestionTypeMap[Key]) => { isError: boolean, message: string, store: QuestionTypeMap[Key] },
    "calculatePoints": (q1: QuestionTypeMap[Key], q2: QuestionTypeMap[Key], maxPoints: number) => number,
    "shuffleAnswers": (question: QuestionTypeMap[Key]) => QuestionTypeMap[Key]
    "onActionWithDB"?: (operation: "create" | "update" | "delete", question: QuestionTypeMap[Key]) => Promise<{ isError: boolean, message?: string, imageUrl?: string, transformedQuestion: QuestionTypeMap[Key] }>
  } & (Key extends string ? AdditionalMethods[Key] : object)
}

export const QUESTION_LIMIT = 25;

// General upload action for image inputs
async function uploadImageAction<T extends (ImageQuestion | BitmapQuestion)>(operation: "delete" | "update" | "create", question: T, uploadLimit = IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB): Promise<{ isError: boolean, message?: string, imageUrl?: string, transformedQuestion: T }> {
  // Transform the question's copy directly so it can be used elsewhere withou conditional checking of question type
  const questionCopy = { ...question }

  if (operation === "delete" || operation === "update") {
    if (question.imageUrl && operation === "update" ? question.imageFile && question.imageFile instanceof File : true) {
      await enviromentFetch({
        path: "cloudinary/deleteImage",
        method: "POST",
        body: JSON.stringify({
          imageUrl: question.imageUrl,
          folderPath: "questions"
        }),
        headers: {
          "Content-type": "application/json"
        }
      })
    }
  }

  if (operation === "create" || operation === "update") {
    const image = question.imageFile
    if ((!image || !(image instanceof File)) && question.imageUrl) return { isError: false, transformedQuestion: questionCopy }
    if (!image || !(image instanceof File)) return { isError: true, message: "No image provided", transformedQuestion: questionCopy }
    if (image.size > uploadLimit * 1024 * 1024) {
      return { isError: true, message: `Image is larger than ${uploadLimit}MB`, transformedQuestion: questionCopy }
    }
    else if (!ALLOWED_IMAGE_TYPES.includes(image.type.split("/")[1])) {
      return { isError: true, message: "Image is not a valid type", transformedQuestion: questionCopy }
    }

    const form = new FormData()
    form.append("image", image)

    const response = await fetch("/api/cloudinary/uploadQuestionImage", {
      method: "POST",
      body: form,
    })

    const json: any = await response.json()
    if (json.url !== undefined) {
      questionCopy.imageUrl = json.url
      return { isError: false, imageUrl: json.url, transformedQuestion: questionCopy }
    }
    return { isError: true, message: "Error in uploading the image", transformedQuestion: questionCopy }
  }
  return { isError: true, message: "Invalid operation", transformedQuestion: questionCopy }
}

// Transform the question into data which will not contain answers
export const questionContentFunctions: QuestionContentTransformation = {
  "pickOne": {
    "createNew": () => {
      return {
        type: 'pickOne',
        correctAnswerId: 0,
        answers: [
          {
            id: 0,
            answer: ''
          },
          {
            id: 1,
            answer: ''
          }
        ]
      }
    },
    "separateAnswer": (question: PickOneQuestion): PartialPick<PickOneQuestion, "correctAnswerId"> => {
      return {
        ...question,
        correctAnswerId: undefined,
        answers: question.answers.map((item) => {
          return {
            ...item,
            response: ""
          }
        })
      }
    },
    "checkAnswerPresence": (question: PickOneQuestion): boolean => {
      return !(question.correctAnswerId === undefined)
    },
    "checkAnswerCorrectness": (answer: PickOneQuestion, original: PickOneQuestion) => {
      return answer.correctAnswerId === original.correctAnswerId
    },
    "checkCreatorCorrectFormat": (content: PickOneQuestion) => {
      let isError = false
      let message = ""

      if (content.correctAnswerId === undefined || content.correctAnswerId > content.answers.length - 1 || content.correctAnswerId < 0) {
        isError = true
        message = "Please select the correct answer."

      }

      for (const item in content.answers) {
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    },
    "calculatePoints": (q1: PickOneQuestion, q2: PickOneQuestion, maxPoints: number) => {
      return q1.correctAnswerId === q2.correctAnswerId ? maxPoints : 0
    },
    "shuffleAnswers": (question: PickOneQuestion): PickOneQuestion => {
      return {
        ...question,
        answers: question.answers.map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
      }
    }
  },
  "trueFalse": {
    "createNew": () => {
      return {
        type: 'trueFalse',
        answers: [
          {
            id: 0,
            answer: '',
            isTrue: false,
          },
          {
            id: 1,
            answer: '',
            isTrue: false
          }
        ]
      }
    },
    "separateAnswer": (question: TrueFalseQuestion): { [Key in keyof TrueFalseQuestion as Key extends "answers" ? never : Key]: TrueFalseQuestion[Key];
    } & { answers: PartialPick<TrueFalseQuestion["answers"][number], "error" | "response">[] } => {
      return {
        ...question,
        answers: question.answers.map((item) => {
          return {
            id: item.id,
            answer: item.answer,
            isTrue: false,
          }
        })
      }
    },
    "checkAnswerPresence": (question: TrueFalseQuestion): boolean => {
      return question.answers.every((item) => item.isTrue !== undefined)
    },
    "checkAnswerCorrectness": (answer: TrueFalseQuestion, original: TrueFalseQuestion) => {
      let total = 0
      for (const item of answer.answers) {
        const originalAnswer = original.answers.find((ans) => ans.id === item.id)
        if (!originalAnswer) return false
        if (originalAnswer.isTrue === item.isTrue) total++
      }
      if (total === answer.answers.length) return true
      if (total === 0) return false
      return "partial"
      // const correctAnswersCount = answer.answers.reduce((count, item, index) => item.isTrue === original.answers[index].isTrue ? count + 1 : count, 0)
      // if (correctAnswersCount === answer.answers.length) return true
      // if (correctAnswersCount === 0) return false
      // return "partial"
    },
    "checkCreatorCorrectFormat": (content: TrueFalseQuestion) => {
      let isError = false

      for (const item in content.answers) {
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    },
    "calculatePoints": (q1: TrueFalseQuestion, q2: TrueFalseQuestion, maxPoints: number) => {
      let total = 0
      for (const item of q1.answers) {
        const originalAnswer = q2.answers.find((ans) => ans.id === item.id)
        if (!originalAnswer) return 0
        if (originalAnswer.isTrue === item.isTrue) total++
      }
      // const correctAnswersCount = q1.answers.reduce((count, item, index) => item.isTrue === q2.answers[index].isTrue ? count + 1 : count, 0)
      return +(total / q1.answers.length * maxPoints).toFixed(2)
    },
    "shuffleAnswers": (question: TrueFalseQuestion): TrueFalseQuestion => {
      return {
        ...question,
        answers: question.answers.map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
      }
    }
  },
  "connect": {
    "createNew": () => {
      return {
        type: 'connect',
        answers: [
          {
            id: 0,
            answer: '',
            matchedAnswerIndex: undefined,
          },
          {
            id: 1,
            answer: '',
            matchedAnswerIndex: undefined,
          }
        ],
        matchedAnswers: {
          [crypto.randomUUID()]: {
            answer: "",
            displayId: 0
          },
          [crypto.randomUUID()]: {
            answer: "",
            displayId: 1
          }
        }
      }
    },
    "separateAnswer": (question: ConnectQuestion): ConnectQuestion => {
      return {
        ...question,
        answers: question.answers.map((item) => {
          return {
            id: item.id,
            answer: item.answer,
            matchedAnswerIndex: undefined
          }
        }),
      }
    },
    "checkAnswerPresence": (question: ConnectQuestion): boolean => {
      const answersCount = Object.keys(question.matchedAnswers).length
      const userAnswersCount = question.answers.filter((item) => item.matchedAnswerIndex !== undefined).length

      return answersCount === userAnswersCount
    },
    "checkAnswerCorrectness": (answer: ConnectQuestion, original: ConnectQuestion) => {
      if (answer.answers.length !== original.answers.length) return false
      let correctAnswersCount = 0
      for (const i in answer.answers) {
        if (answer.answers[i].matchedAnswerIndex === original.answers[answer.answers[i].id].matchedAnswerIndex) {
          correctAnswersCount++
        }
      }
      if (correctAnswersCount === answer.answers.length) return true
      else if (correctAnswersCount === 0) return false
      return "partial"
    },
    "checkCreatorCorrectFormat": (content: ConnectQuestion) => {
      let isError = false

      for (const item in content.answers) {
        if (content.answers[item].matchedAnswerIndex == undefined) {
          isError = true
          content.answers[item].error = "Please select the correct answer."
          continue
        }
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      for (const item in content.matchedAnswers) {
        const result = answerSchema.safeParse(content.matchedAnswers[item].answer)
        if (result.success === false) {
          isError = true
          content.matchedAnswers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    },
    "calculatePoints": (q1: ConnectQuestion, q2: ConnectQuestion, maxPoints: number) => {
      // const correctAnswersCount = q1.answers.reduce((count, item, index) => item.matchedAnswerIndex === q2.answers[index].matchedAnswerIndex ? count + 1 : count, 0)
      const correctAnswersCount = q1.answers.reduce((count, item, index) => {
        const q2Answer = q2.answers.find(ans => ans.id === item.id)
        if (!q2Answer) return count
        if (item.matchedAnswerIndex === q2Answer.matchedAnswerIndex) return count + 1
        return count
      }, 0)
      return +(correctAnswersCount / q1.answers.length * maxPoints).toFixed(2)
    },
    "shuffleAnswers": (question: ConnectQuestion): ConnectQuestion => {
      const shuffled = {
        ...question,
        answers: question.answers.map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value),
        matchedAnswers: Object.fromEntries(Object.entries(question.matchedAnswers).map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value))
      }

      const keys = Object.keys(shuffled.matchedAnswers)
      for (const i in keys) {
        shuffled.matchedAnswers[keys[i]].displayId = +i
      }

      return shuffled
    }
  },
  "write": {
    "createNew": () => {
      return {
        type: 'write',
        answers: [
          {
            id: 0,
            answer: ''
          }
        ]
      }
    },
    "separateAnswer": (question: WriteQuestion): WriteQuestion => {
      return {
        ...question,
        answers: [{ id: 0, answer: "" }]
      }
    },
    "checkAnswerPresence": (question: WriteQuestion): boolean => {
      return !(question.answers[0].answer === "")
    },
    "checkAnswerCorrectness": (answer: WriteQuestion, original: WriteQuestion) => {
      return original.answers.map(item => item.answer.toLowerCase().replace(/\s/g, "")).includes(answer.answers[0].answer.toLowerCase().replace(/\s/g, ""))
    },
    "checkCreatorCorrectFormat": (content: WriteQuestion) => {
      let isError = false

      for (const item in content.answers) {
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    },
    "calculatePoints": (q1: WriteQuestion, q2: WriteQuestion, maxPoints: number) => {
      return q1.answers.map(item => item.answer.toLowerCase().replace(/\s/g, "")).includes(q2.answers[0].answer.toLowerCase().replace(/\s/g, "")) ? maxPoints : 0
    },
    "shuffleAnswers": (question: WriteQuestion): WriteQuestion => {
      return question
    }
  },
  "fill": {
    "createNew": () => {
      return {
        type: 'fill',
        answers: [
          {
            id: 0,
            answer: {
              options: [""],
              precedent: "",
              sequent: "",
              errors: {
                options: []
              }
            }
          }
        ]
      }
    },
    "separateAnswer": (question: FillQuestion): FillQuestion => {
      return {
        ...question,
        answers: question.answers.map(item => {
          return {
            id: item.id,
            answer: {
              options: [""],
              precedent: item.answer.precedent,
              sequent: item.answer.sequent,
              errors: {
                options: []
              }
            }
          }
        })
      }
    },
    "checkAnswerPresence": (question: FillQuestion): boolean => {
      return question.answers.every(item => item.answer.options[0] !== "")
    },
    "checkAnswerCorrectness": (answer: FillQuestion, original: FillQuestion) => {
      const correctAnswersCount = original.answers.reduce((count, item, index) => item.answer.options.map(ans => ans.toLowerCase().replace(/\s/g, "")).includes(answer.answers[index].answer.options[0].toLowerCase().replace(/\s/g, "")) ? count + 1 : count, 0)
      if (correctAnswersCount === answer.answers.length) return true
      if (correctAnswersCount === 0) return false
      return "partial"
    },
    "checkCreatorCorrectFormat": (content: FillQuestion) => {
      let isError = false

      for (const answer in content.answers) {
        for (const option in content.answers[answer].answer.options) {
          const result = answerSchema.safeParse(content.answers[answer].answer.options[option])
          if (result.success === false) {
            isError = true
            content.answers[answer].answer.errors.options[option] = result.error.errors[0].message
          }
        }

        const prec = answerSchema.safeParse(content.answers[answer].answer.precedent)
        const seq = answerSchema.safeParse(content.answers[answer].answer.sequent)

        if (prec.success === false) {
          isError = true
          content.answers[answer].answer.errors.precedent = prec.error.errors[0].message
        }

        if (seq.success === false) {
          isError = true
          content.answers[answer].answer.errors.sequent = seq.error.errors[0].message
        }

      }

      return {
        isError: isError,
        message: "",
        store: content
      }
    },
    "calculatePoints": (q1: FillQuestion, q2: FillQuestion, maxPoints: number) => {
      const correctAnswersCount = q1.answers.reduce((count, item, index) => item.answer.options.map(ans => ans.toLowerCase().replace(/\s/g, "")).includes(q2.answers[index].answer.options[0].toLowerCase().replace(/\s/g, "")) ? count + 1 : count, 0)
      return +(correctAnswersCount / q1.answers.length * maxPoints).toFixed(2)
    },
    "checkOptionCorrectness": (option: FillQuestion["answers"][number]["answer"]["options"][number], correctOptions: FillQuestion["answers"][number]["answer"]["options"]): boolean => {
      return (correctOptions.map(ans => ans.toLowerCase().replace(/\s/g, "")).includes(option.toLowerCase().replace(/\s/g, "")))
    },
    "shuffleAnswers": (question: FillQuestion): FillQuestion => {
      return question
    }
  },
  "geography": {
    "createNew": () => {
      return {
        type: "geography",
        initial: {
          location: [50.143477, 14.094096],
          zoom: 6
        },
        tolerence: GEOGRAPHY_TOLERANCE_DEFAULT,
        answerPoint: {
          location: [49.937082, 17.907414]
        }
      }
    },
    "separateAnswer": (question: GeographyQuestion): GeographyQuestion => {
      return {
        ...question,
        answerPoint: {
          location: question.initial.location
        }
      }
    },
    "checkAnswerPresence": (question: GeographyQuestion): boolean => {
      return typeof question.answerPoint.location[0] === "number" && typeof question.answerPoint.location[1] === "number"
    },
    "checkAnswerCorrectness": (answer: GeographyQuestion, original: GeographyQuestion) => {
      if (!answer.answerPoint.location || !original.answerPoint.location) return false
      const lat1 = answer.answerPoint.location[0]
      const lon1 = answer.answerPoint.location[1]
      const lat2 = original.answerPoint.location[0]
      const lon2 = original.answerPoint.location[1]

      const R = 6371; // Radius of the Earth in kilometers
      const dLat = (lat2 - lat1) * (Math.PI / 180);
      const dLon = (lon2 - lon1) * (Math.PI / 180);
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return distance <= original.tolerence
    },
    "checkCreatorCorrectFormat": (content: GeographyQuestion) => {
      let isError = false
      let message = ""

      const parsedTolerance = geographyToleranceSchema.safeParse(content.tolerence)

      if (parsedTolerance.success === false) {
        isError = true
        message = parsedTolerance.error.errors[0].message
      }

      const parsedLocation = geographyLocationSchema.safeParse(content.initial.location)

      if (parsedLocation.success === false) {
        isError = true
        message = parsedLocation.error.errors[0].message
      }

      const answerLocation = geographyLocationSchema.safeParse(content.answerPoint.location)

      if (answerLocation.success === false) {
        isError = true
        message = answerLocation.error.errors[0].message
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    },
    "calculatePoints": (q1: GeographyQuestion, q2: GeographyQuestion, maxPoints: number) => {
      return questionContentFunctions["geography"].checkAnswerCorrectness(q1, q2) ? maxPoints : 0
    },
    "shuffleAnswers": (question: GeographyQuestion): GeographyQuestion => {
      return question
    }
  },
  "image": {
    "createNew": () => {
      return {
        type: 'image',
        correctAnswerId: 0,
        imageUrl: undefined,
        answers: [
          {
            id: 0,
            answer: ''
          },
          {
            id: 1,
            answer: ''
          }
        ]
      }
    },
    "separateAnswer": (question: ImageQuestion): ImageQuestion => {
      return {
        ...question,
        correctAnswerId: undefined,
        answers: question.answers.map((item) => {
          return {
            ...item,
            response: ""
          }
        })
      }
    },
    "checkAnswerPresence": (question: ImageQuestion): boolean => {
      return !(question.correctAnswerId === undefined)
    },
    "checkAnswerCorrectness": (answer: ImageQuestion, original: ImageQuestion) => {
      return answer.correctAnswerId === original.correctAnswerId
    },
    "checkCreatorCorrectFormat": (content: ImageQuestion) => {
      let isError = false
      let message = ""

      if (content.correctAnswerId === undefined || content.correctAnswerId > content.answers.length - 1 || content.correctAnswerId < 0) {
        isError = true
        message = "Please select the correct answer."

      }

      if (!content.imageUrl && !content.imageFile) {
        isError = true
        message = "Please include image"
      }

      for (const item in content.answers) {
        const result = answerSchema.safeParse(content.answers[item].answer)
        if (result.success === false) {
          isError = true
          content.answers[item].error = result.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    },
    "calculatePoints": (q1: ImageQuestion, q2: ImageQuestion, maxPoints: number) => {
      return q1.correctAnswerId === q2.correctAnswerId ? maxPoints : 0
    },
    "shuffleAnswers": (question: ImageQuestion): ImageQuestion => {
      return {
        ...question,
        answers: question.answers.map(value => ({ value, sort: Math.random() }))
          .sort((a, b) => a.sort - b.sort)
          .map(({ value }) => value)
      }
    },
    "onActionWithDB": async (operation, question) => {
      return uploadImageAction(operation, question)
    }

  },
  "bitmap": {
    "createNew": () => {
      return {
        type: "bitmap",
        zoom: BITMAP_ZOOM_MIN,
        tolerence: GEOGRAPHY_TOLERANCE_DEFAULT,
        answerPoint: {
          location: [0, 0]
        }
      }
    },
    "separateAnswer": (question): BitmapQuestion => {
      return {
        ...question,
        answerPoint: {
          location: [0, 0]
        }
      }
    },
    "checkAnswerPresence": (question): boolean => {
      return typeof question.answerPoint.location[0] === "number" && typeof question.answerPoint.location[1] === "number"
    },
    "checkAnswerCorrectness": (answer, original) => {
      const answerDistance = Math.sqrt(Math.abs(answer.answerPoint.location[0] - original.answerPoint.location[0]) ** 2 + Math.abs(answer.answerPoint.location[1] - original.answerPoint.location[1]) ** 2)

      return answerDistance <= original.tolerence
    },
    "checkCreatorCorrectFormat": (content) => {
      let isError = false
      let message = ""

      const parsedTolerance = bitmapToleranceSchema.safeParse(content.tolerence)

      if (parsedTolerance.success === false) {
        isError = true
        message = parsedTolerance.error.errors[0].message
      }

      const answerLocation = bitmapLocationSchema.safeParse(content.answerPoint.location)

      if (answerLocation.success === false) {
        isError = true
        message = answerLocation.error.errors[0].message
      }

      if (!content.imageUrl && !content.imageFile) {
        isError = true
        message = "Please include image"
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    },
    "calculatePoints": (q1, q2, maxPoints: number) => {
      return questionContentFunctions["bitmap"].checkAnswerCorrectness(q1, q2) ? maxPoints : 0
    },
    "shuffleAnswers": (question): BitmapQuestion => {
      return question
    },
    "onActionWithDB": async (operation, question) => {
      console.log(question, question.imageFile)
      return uploadImageAction(operation, question)
    }
  },
  "programming": {
    "createNew": () => {
      return {
        type: 'programming',
        description: '',
        code: '',
        language: 'js',
        tests: [
          {
            input: '',
            output: '',
            error: ''
          }
        ],
        hints: [],
        errors: {}
      }
    },
    "separateAnswer": (question: ProgrammingQuestion): PartialPick<ProgrammingQuestion, "code"> => {
      return {
        ...question,
        code: ""
      }
    },
    "checkAnswerPresence": (question: ProgrammingQuestion): boolean => {
      return true
    },
    "checkAnswerCorrectness": (answer: ProgrammingQuestion, original: ProgrammingQuestion) => {
      const data = validateCode(answer.code, original.tests)
      if (!data) return false
      const isAllRight = data.testPasses.find(item => item === false) === undefined
      if (isAllRight) return true
      const isAnyRight = data.testPasses.find(item => item === true) !== undefined
      if (isAnyRight) return "partial"
      return false
    },
    "checkCreatorCorrectFormat": (content: ProgrammingQuestion) => {
      let isError = false
      let message = ""

      if (!content.language) {
        isError = true
        message = "Please select the language."
      }

      if (!content.description) {
        isError = true

        const parsedDescription = programmingDescriptionSchema.safeParse(content.description)
        if (parsedDescription.success === false) {
          isError = true
          content.errors.description = parsedDescription.error.errors[0].message
        }
      }

      if (content.tests === undefined) {
        isError = true
        message = "Please add the tests."
      }
      else {
        for (const i in content.tests) {
          const input = programmingTestInputSchema.safeParse(content.tests[i].input)

          if (input.success === false) {
            isError = true
            if (content.errors.tests === undefined) content.errors.tests = []
            if (content.errors.tests[i] === undefined) content.errors.tests[i] = {}
            content.errors.tests[i].input = input.error.errors[0].message
          }

          const output = programmingTestOutputSchema.safeParse(content.tests[i].output)

          if (output.success === false) {
            isError = true
            if (content.errors.tests === undefined) content.errors.tests = []
            if (content.errors.tests[i] === undefined) content.errors.tests[i] = {}
            content.errors.tests[i].output = output.error.errors[0].message
          }
        }
      }

      for (const i in content.hints) {
        const hint = programmingHintSchema.safeParse(content.hints[i])

        if (hint.success === false) {
          isError = true
          if (content.errors.hints === undefined) content.errors.hints = []
          content.errors.hints[i] = hint.error.errors[0].message
        }
      }

      return {
        isError: isError,
        message: message,
        store: content
      }
    },
    "calculatePoints": (q1: ProgrammingQuestion, q2: ProgrammingQuestion, maxPoints: number) => {
      return questionContentFunctions["programming"]["checkAnswerCorrectness"](q1, q2) ? maxPoints : 0
    },
    "shuffleAnswers": (question: ProgrammingQuestion): ProgrammingQuestion => {
      return question
    }
  }
}