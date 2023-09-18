import { z } from "zod";
import { groupDescriptionSchema, groupNameSchema } from "~schemas/textInput";

export const createGroupSchema = z.object({
  name: groupNameSchema,
  description: groupDescriptionSchema
})