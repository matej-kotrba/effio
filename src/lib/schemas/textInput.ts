import { z } from "zod"

export const asnwerSchema = z.string().min(1, "Answer has to be at least 1 character long.").max(100, "Answer can be max 100 characters long.")