import { z } from "zod";
import { groupDescriptionSchema, groupNameSchema, joinCodeSchema } from "~schemas/textInput";

export const createGroupSchema = z.object({
  name: groupNameSchema,
  description: groupDescriptionSchema
})

export const joinGroupSchema = z.object({
  code: joinCodeSchema
})