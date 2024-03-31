import { z } from "zod";
import { channelNameSchema, channelTypeSchema, groupNameSchema } from "~schemas/testValidation";
import { joinCodeSchema } from "~schemas/inviteCode";

export const createGroupSchema = z.object({
  name: groupNameSchema,
  image: z.string().optional()
})

export const updateGroupSchema = z.object({
  id: z.string(),
  name: groupNameSchema,
  "image-upload-group": z.string().optional()
})

export const deleteGroupSchema = z.object({
  id: z.string(),
  validation_name: groupNameSchema
})

export const joinGroupSchema = z.object({
  code: joinCodeSchema
})

export const channelCreateSchema = z.object({
  id: z.string(),
  name: channelNameSchema,
  newChannelType: channelTypeSchema
})

export const kickUserFromGroupSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  shouldBan: z.boolean().optional()
})