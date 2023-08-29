import { z } from "zod"

export const ANSWER_MIN = 1
export const ANSWER_MAX = 100
export const ANSWER_TITLE_MIN = 8
export const ANSWER_TITLE_MAX = 250
export const DESCRIPTION_MIN = 15
export const DESCRIPTION_MAX = 255
export const TITLE_MIN = 8
export const TITLE_MAX = 40

export const WRITE_ANSWER_MIN = 1
export const WRITE_AMSWER_MAX = 30

export const MARK_MIN = 1
export const MARK_MAX = 15
export const MARK_LIMIT_MIN = 0
export const MARK_LIMIT_MAX = 100

export const answerSchema = z.string().min(ANSWER_MIN, "Answer has to be at least 1 character long.").max(ANSWER_MAX, "Answer can be max 100 characters long.")
export const titleSchema = z.string().min(TITLE_MIN, `Title has to be at least ${TITLE_MIN} character long.`).max(TITLE_MAX, `Title can be max ${TITLE_MAX} characters long.`)
export const descriptionSchema = z.string().min(DESCRIPTION_MIN, "Tell the users what your test will be about with at least 15 characters.").max(DESCRIPTION_MAX, "Description can be max 255 characters long.")
export const writeAnswerSchema = z.string().min(WRITE_ANSWER_MIN, "Write answer has to be at least 1 character long.").max(WRITE_AMSWER_MAX, "Answer can be max 30 characters long.")
export const markSchema = z.string().min(MARK_MIN, "Mark has to be at least 1 character long.").max(MARK_MAX, "Mark can be max 15 characters long.")
export const markLimitSchema = z.number().min(MARK_LIMIT_MIN, "Limit cannot be less than 0.").max(MARK_LIMIT_MAX, "Limit cannot be more than 100.")