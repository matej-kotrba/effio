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

export const channelUpdateSchema = z.object({
  id: z.string(),
  name: channelNameSchema,
})

export const channelDeleteSchema = z.object({
  id: z.string(),
})

export const kickUserFromGroupSchema = z.object({
  groupId: z.string(),
  userId: z.string(),
  shouldBan: z.boolean().optional()
})

export const resetUsersAttemptsSchema = z.object({
  testId: z.string(),
  subcategoryId: z.string()
})