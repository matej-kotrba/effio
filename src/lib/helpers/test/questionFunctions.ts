import { validateCode } from "~helpers/validateCode"
import { answerSchema, GEOGRAPHY_TOLERANCE_DEFAULT, geographyToleranceSchema, geographyLocationSchema, programmingDescriptionSchema, programmingTestInputSchema, programmingTestOutputSchema, programmingHintSchema } from "~schemas/textInput"

type QuestionMethods = {
  [Key in keyof QuestionTypeMap]: {
    icon: string
  }
}

export const questionMethods: QuestionMethods = {
  "pickOne": {
    icon: "fa-solid:hand-point-right"
  },
  "true/false": {
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
  }
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
    [key: string]: any
  }
}

export const QUESTION_LIMIT = 25;

// Transform the question into data which will not contain answers
export const questionContentFunctions: QuestionContentTransformation = {
  "pickOne": {
    "createNew": () => {
      return {
        type: 'pickOne',
        correctAnswerIndex: 0,
        answers: [
          {
            answer: ''
          },
          {
            answer: ''
          }
        ]
      }
    },
    "separateAnswer": (question: PickOneQuestion): PartialPick<PickOneQuestion, "correctAnswerIndex"> => {
      return {
        ...question,
        correctAnswerIndex: undefined,
        answers: question.answers.map((item) => {
          return {
            ...item,
            response: ""
          }
        })
      }
    },
    "checkAnswerPresence": (question: PickOneQuestion): boolean => {
      return !(question.correctAnswerIndex === undefined)
    },
    "checkAnswerCorrectness": (answer: PickOneQuestion, original: PickOneQuestion) => {
      return answer.correctAnswerIndex === original.correctAnswerIndex
    },
    "checkCreatorCorrectFormat": (content: PickOneQuestion) => {
      let isError = false
      let message = ""

      if (content.correctAnswerIndex === undefined || content.correctAnswerIndex > content.answers.length - 1 || content.correctAnswerIndex < 0) {
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
      return q1.correctAnswerIndex === q2.correctAnswerIndex ? maxPoints : 0
    }
  },
  "true/false": {
    "createNew": () => {
      return {
        type: 'true/false',
        answers: [
          {
            answer: '',
            isTrue: false
          },
          {
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
      const correctAnswersCount = answer.answers.reduce((count, item, index) => item.isTrue === original.answers[index].isTrue ? count + 1 : count, 0)
      if (correctAnswersCount === answer.answers.length) return true
      if (correctAnswersCount === 0) return false
      return "partial"
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
      const correctAnswersCount = q1.answers.reduce((count, item, index) => item.isTrue === q2.answers[index].isTrue ? count + 1 : count, 0)
      return +(correctAnswersCount / q1.answers.length * maxPoints).toFixed(2)
    }
  },
  "connect": {
    "createNew": () => {
      return {
        type: 'connect',
        answers: [
          {
            answer: '',
            matchedAnswerIndex: undefined,
          },
          {
            answer: '',
            matchedAnswerIndex: undefined,
          }
        ],
        matchedAnswers: {
          [crypto.randomUUID()]: {
            answer: ""
          },
          [crypto.randomUUID()]: {
            answer: ""
          }
        }
      }
    },
    "separateAnswer": (question: ConnectQuestion): ConnectQuestion => {
      return {
        ...question,
        answers: question.answers.map((item) => {
          return {
            answer: item.answer,
            matchedAnswerIndex: undefined
          }
        })
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
        if (answer.answers[i].matchedAnswerIndex === original.answers[i].matchedAnswerIndex) {
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
      const correctAnswersCount = q1.answers.reduce((count, item, index) => item.matchedAnswerIndex === q2.answers[index].matchedAnswerIndex ? count + 1 : count, 0)
      return +(correctAnswersCount / q1.answers.length * maxPoints).toFixed(2)
    }
  },
  "write": {
    "createNew": () => {
      return {
        type: 'write',
        answers: [
          {
            answer: ''
          }
        ]
      }
    },
    "separateAnswer": (question: WriteQuestion): WriteQuestion => {
      return {
        ...question,
        answers: [{ answer: "" }]
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
    }
  },
  "fill": {
    "createNew": () => {
      return {
        type: 'fill',
        answers: [
          {
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
    }
  },
  "geography": {
    createNew: () => {
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
    separateAnswer: (question: GeographyQuestion): GeographyQuestion => {
      return {
        ...question,
        answerPoint: {
          location: question.initial.location
        }
      }
    },
    checkAnswerPresence: (question: GeographyQuestion): boolean => {
      return typeof question.answerPoint.location[0] === "number" && typeof question.answerPoint.location[1] === "number"
    },
    checkAnswerCorrectness: (answer: GeographyQuestion, original: GeographyQuestion) => {
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
    checkCreatorCorrectFormat: (content: GeographyQuestion) => {
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
    calculatePoints: (q1: GeographyQuestion, q2: GeographyQuestion, maxPoints: number) => {
      return questionContentFunctions["geography"].checkAnswerCorrectness(q1, q2) ? maxPoints : 0
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
    }
  }
}