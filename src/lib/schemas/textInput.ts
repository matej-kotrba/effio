import { z } from "zod"
import { randomId } from "~helpers/randomId"

// GENERAL ANSWER
export const ANSWER_MIN = 1
export const ANSWER_MAX = 100
export const ANSWER_TITLE_MIN = 8
export const ANSWER_TITLE_MAX = 250
export const DESCRIPTION_MIN = 15
export const DESCRIPTION_MAX = 255
export const TITLE_MIN = 8
export const TITLE_MAX = 40

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
export const GEOGRAPHY_TOLERANCE_MAX = 10000
export const GEOGRAPHY_TOLERANCE_DEFAULT = 400
export const GEOGRAPHY_ZOOM_MIN = 2
export const GEOGRAPHY_ZOOM_MAX = 18

// SCHEMAS
export const answerSchema = z.string().min(ANSWER_MIN, "Answer has to be at least 1 character long.").max(ANSWER_MAX, "Answer can be max 100 characters long.")
export const titleSchema = z.string().min(TITLE_MIN, `Title has to be at least ${TITLE_MIN} characters long.`).max(TITLE_MAX, `Title can be max ${TITLE_MAX} characters long.`)
export const descriptionSchema = z.string().min(DESCRIPTION_MIN, "Tell the users what your test will be about with at least 15 characters.").max(DESCRIPTION_MAX, "Description can be max 255 characters long.")
export const writeAnswerSchema = z.string().min(WRITE_ANSWER_MIN, "Write answer has to be at least 1 character long.").max(WRITE_AMSWER_MAX, "Answer can be max 30 characters long.")
export const markSchema = z.string().min(MARK_MIN, "Mark has to be at least 1 character long.").max(MARK_MAX, "Mark can be max 15 characters long.")
export const markLimitSchema = z.number({ required_error: "Please select a value" }).min(MARK_LIMIT_MIN, "Limit cannot be less than 0.").max(MARK_LIMIT_MAX, "Limit cannot be more than 100.")
export const groupNameSchema = z.string().min(GROUP_NAME_MIN, `Mark has to be at least ${GROUP_NAME_MIN} character long.`).max(GROUP_NAME_MAX, `Mark can be max ${GROUP_NAME_MAX} characters long.`)
export const groupDescriptionSchema = z.string().max(GROUP_DESCRIPTION_MAX, `Mark can be max ${GROUP_DESCRIPTION_MAX} characters long.`)
export const chatInputSchema = z.string().min(CHAT_INPUT_MIN, "Message has to be at least 1 character long.").max(CHAT_INPUT_MAX, "Message can be max 255 characters long.")
export const geographyToleranceSchema = z.number({ invalid_type_error: "Input has to be a valid number" }).min(GEOGRAPHY_TOLERANCE_MIN, "Tolerance cannot be less than 0.").max(GEOGRAPHY_TOLERANCE_MAX, "Tolerance cannot be more than 10000.").nonnegative("Tolerance cannot be negative.")
export const latitudeSchema = z.number({ invalid_type_error: "Input has to be a valid number" }).min(LATITUDE_MIN, "Number has to be bigger than -90").max(LATITUDE_MAX, "Number has to be smaller than 90");
export const longitudeSchema = z.number({ invalid_type_error: "Input has to be a valid number" }).min(LONGITUDE_MIN, "Number has to be bigger than -180").max(LONGITUDE_MAX, "Number has to be smaller than 180");
export const geographyLocationSchema = z.tuple([latitudeSchema, longitudeSchema], { invalid_type_error: "Latitude and longitude has to be valid numbers." })