import { z } from "zod"

export const asnwerSchema = z.string().min(1, "Answer has to be at least 1 character long.").max(100, "Answer can be max 100 characters long.")
export const titleSchema = z.string().min(8, "Title has to be at least 8 character long.").max(250, "Title can be max 250 characters long.")