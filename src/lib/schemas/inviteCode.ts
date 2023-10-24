import { z } from "zod"
import { randomId } from "~helpers/randomId"

export const JOIN_CODE_LENGTH = randomId().length
export const JOIN_CODE_EXPIRATION_VALUE = 1000 * 60 * 60 * 24

export const joinCodeSchema = z.string().length(JOIN_CODE_LENGTH, `Join code has to be ${JOIN_CODE_LENGTH} characters long.`)