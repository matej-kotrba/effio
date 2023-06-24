import type { Prisma } from "@prisma/client"

type TestFullType = Prisma.TestGetPayload<{
  include: {
    owner: true,
    questions: {
      include: {
        type: true
      }
    },
    tags: true
  }
}>