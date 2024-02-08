import { z } from "zod"

// GENERAL ANSWER
export const ANSWER_MIN = 1
export const ANSWER_MAX = 150
export const ANSWER_TITLE_MIN = 8
export const ANSWER_TITLE_MAX = 250
export const DESCRIPTION_MIN = 15
export const DESCRIPTION_MAX = 255
export const TITLE_MIN = 8
export const TITLE_MAX = 150
export const RESPONSE_MIN = 1
export const RESPONSE_MAX = 255

// WRITE TYPE ANSWER SPECIFIC
export const WRITE_ANSWER_MIN = 1
export const WRITE_AMSWER_MAX = 30


// MARKS AND ITS LIMITS
export const MARK_MIN = 1
export const MARK_MAX = 15
export const MARK_LIMIT_MIN = 0
export const MARK_LIMIT_MAX = 100
export const MARK_LIMIT_MAX_MARK_COUNT = 10
export const LIMIT_OPTIONS = [
  100, 95, 90, 85, 80, 75, 70, 65, 60, 55, 50, 45, 40, 35, 30, 25, 20, 15, 10,
  5
] as const;

// GROUP GENERAL
export const GROUP_NAME_MAX = 25
export const GROUP_NAME_MIN = 5
export const GROUP_DESCRIPTION_MAX = 255
export const GROUP_DESCRIPTION_MIN = 0

// CHAT INPUT SPECIFIC
export const CHAT_INPUT_MAX = 255
export const CHAT_INPUT_MIN = 1

// GEOGRAPHY SPECIFIC
export const LATITUDE_MAX = 90
export const LATITUDE_MIN = -90
export const LONGITUDE_MAX = 180
export const LONGITUDE_MIN = -180
export const GEOGRAPHY_TOLERANCE_MIN = 0
export const GEOGRAPHY_TOLERANCE_MAX = 2500
export const GEOGRAPHY_TOLERANCE_DEFAULT = 100
export const GEOGRAPHY_ZOOM_MIN = 2
export const GEOGRAPHY_ZOOM_MAX = 18

// BITMAP SPECIFIC
export const BITMAP_ZOOM_MIN = -2
export const BITMAP_ZOOM_MAX = 1

// PROGRAMMING SPECIFIC
export const PROGRAMMING_DESCRIPTION_MIN = 15
export const PROGRAMMING_DESCRIPTION_MAX = 1024
export const PROGRAMMING_TEST_MIN = 1
export const PROGRAMMING_TEST_MAX = 255


// SCHEMAS
export const answerSchema = z.string().min(ANSWER_MIN, `Answer has to be at least ${ANSWER_MIN} character long.`).max(ANSWER_MAX, `Answer can be max ${ANSWER_MAX} characters long.`)
export const titleSchema = z.string().min(TITLE_MIN, `Title has to be at least ${TITLE_MIN} characters long.`).max(TITLE_MAX, `Title can be max ${TITLE_MAX} characters long.`)
export const descriptionSchema = z.string().min(DESCRIPTION_MIN, `Tell the users what your test will be about with at least ${DESCRIPTION_MIN} characters.`).max(DESCRIPTION_MAX, `Description can be max ${DESCRIPTION_MAX} characters long.`)
export const responseSchema = z.string().min(RESPONSE_MIN, `Response has to be at least ${RESPONSE_MIN} character long.`).max(RESPONSE_MAX, `Response can be max ${RESPONSE_MAX} characters long.`)
export const writeAnswerSchema = z.string().min(WRITE_ANSWER_MIN, "Write answer has to be at least 1 character long.").max(WRITE_AMSWER_MAX, "Answer can be max 30 characters long.")
export const markSchema = z.string().min(MARK_MIN, `Mark has to be at least ${MARK_MIN} character long.`).max(MARK_MAX, `Mark can be max ${MARK_MAX} characters long.`)
export const markLimitSchema = z.number({ required_error: "Please select a value" }).min(MARK_LIMIT_MIN, "Limit cannot be less than 0.").max(MARK_LIMIT_MAX, "Limit cannot be more than 100.")
export const groupNameSchema = z.string().min(GROUP_NAME_MIN, `Mark has to be at least ${GROUP_NAME_MIN} character long.`).max(GROUP_NAME_MAX, `Mark can be max ${GROUP_NAME_MAX} characters long.`)
export const groupDescriptionSchema = z.string().max(GROUP_DESCRIPTION_MAX, `Mark can be max ${GROUP_DESCRIPTION_MAX} characters long.`)
export const chatInputSchema = z.string().min(CHAT_INPUT_MIN, "Message has to be at least 1 character long.").max(CHAT_INPUT_MAX, "Message can be max 255 characters long.")
export const geographyToleranceSchema = z.number({ invalid_type_error: "Input has to be a valid number" }).min(GEOGRAPHY_TOLERANCE_MIN, "Tolerance cannot be less than 0.").max(GEOGRAPHY_TOLERANCE_MAX, "Tolerance cannot be more than 10000.").nonnegative("Tolerance cannot be negative.")
export const latitudeSchema = z.number({ invalid_type_error: "Input has to be a valid number" }).min(LATITUDE_MIN, "Number has to be bigger than -90").max(LATITUDE_MAX, "Number has to be smaller than 90");
export const longitudeSchema = z.number({ invalid_type_error: "Input has to be a valid number" }).min(LONGITUDE_MIN, "Number has to be bigger than -180").max(LONGITUDE_MAX, "Number has to be smaller than 180");
export const geographyLocationSchema = z.tuple([latitudeSchema, longitudeSchema], { invalid_type_error: "Latitude and longitude has to be valid numbers." })
export const programmingDescriptionSchema = z.string().min(PROGRAMMING_DESCRIPTION_MIN, `Description has to be at least ${PROGRAMMING_DESCRIPTION_MIN} character long.`).max(PROGRAMMING_DESCRIPTION_MAX, `Description can be max ${PROGRAMMING_DESCRIPTION_MAX} characters long.`)
export const programmingTestInputSchema = z.string().min(PROGRAMMING_TEST_MIN, `Input has to be at least ${PROGRAMMING_TEST_MIN} character long.`).max(PROGRAMMING_TEST_MAX, `Input can be max ${PROGRAMMING_TEST_MAX} characters long.`)
export const programmingTestOutputSchema = z.string().min(PROGRAMMING_TEST_MIN, `Output has to be at least ${PROGRAMMING_TEST_MIN} character long.`).max(PROGRAMMING_TEST_MAX, `Output can be max ${PROGRAMMING_TEST_MAX} characters long.`)
export const programmingTestSchema = z.object<{
  [Key in keyof ProgrammingQuestion["tests"][number]]: z.ZodString;
}>({
  input: programmingTestInputSchema,
  output: programmingTestOutputSchema
})
export const programmingHintSchema = z.string().min(PROGRAMMING_TEST_MIN, `Input has to be at least ${PROGRAMMING_TEST_MIN} character long.`).max(PROGRAMMING_TEST_MAX, `Input can be max ${PROGRAMMING_TEST_MAX} characters long.`)