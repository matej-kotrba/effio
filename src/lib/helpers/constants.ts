import type { GroupSubcategoryType } from "@prisma/client"

export const IMAGE_IMPORT_SIZE_IN_MB = 1
export const IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB = 3

export const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export const ALLOWED_IMAGE_TYPES = ["png", "jpg", "jpeg", "avif", "webp"]

// Maximal values
export const MAX_GROUP_OWNER_COUNT = 10

// Validation regex
// Database string regex validation
export const DB_STRING_REGEX = /^[a-zA-Z0-9 ,?!\-.:\u00C0-\u024F]+$/
export const DB_STRING_MESSAGE = 'Only letters, numbers, and ,?!-.: are allowed'


// Group channels types (coz Prisma is stupid)
export const GROUP_SUBCATEGORY_TYPES: { [Key in GroupSubcategoryType]: Key } = {
  CHAT: "CHAT",
  ANNOUCEMENT: "ANNOUCEMENT"
}