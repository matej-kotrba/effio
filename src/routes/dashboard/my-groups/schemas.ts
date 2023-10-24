import { z } from "zod";
import { groupDescriptionSchema, groupNameSchema } from "~schemas/textInput";
import { joinCodeSchema } from "~schemas/inviteCode";

export const createGroupSchema = z.object({
  name: groupNameSchema,
  description: groupDescriptionSchema
})

export const joinGroupSchema = z.object({
  code: joinCodeSchema
})