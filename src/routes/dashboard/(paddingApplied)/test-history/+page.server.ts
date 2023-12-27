import prisma from '~/lib/prisma.js'

export const load = async () => {
  const recordsCount = prisma.testRecord.count()

  return {
    streaming: {
      recordsCount
    }
  }
}