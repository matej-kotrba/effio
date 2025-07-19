import { redirect } from '@sveltejs/kit';
import prisma from '~/lib/prisma.js';

export const load = async ({ params }) => {
  const testRecordId = params.testRecordId as string;

  if (!testRecordId) redirect(307, "/dashboard/my-groups");

  const testRecord = prisma.testRecord.findUnique({
    where: {
      id: testRecordId
    },
    include: {
      questionRecords: {
        include: {
          question: {
            include: {
              type: true
            }
          }
        }
      }
    }
  })

  return {
    streamingTestRecord: {
      testRecord: testRecord
    }
  }
}