import { z } from "zod";
import { channelNameSchema, channelTypeSchema, groupDescriptionSchema, groupNameSchema } from "~schemas/testValidation";
import { joinCodeSchema } from "~schemas/inviteCode";

export const createGroupSchema = z.object({
  name: groupNameSchema,
  description: groupDescriptionSchema,
  image: z.string().optional()
})

export const updateGroupSchema = z.object({
  id: z.string(),
  name: groupNameSchema,
  description: groupDescriptionSchema,
  "image-upload-group": z.string().optional()
})

export const joinGroupSchema = z.object({
  code: joinCodeSchema
})

export const channelCreateSchema = z.object({
  id: z.string(),
  name: channelNameSchema,
  newChannelType: channelTypeSchema
})
