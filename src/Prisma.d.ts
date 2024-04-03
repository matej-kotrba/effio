import type { Prisma } from "@prisma/client"

type TestFullType = Prisma.TestGetPayload<{
  include: {
    owner: true,
    tags: {
      include: {
        tag: true
      }
    },
    testVersions: {
      include: {
        questions: {
          include: {
            type: true
          }
        },
        records?: true
      }
    }
  }
}>

type TestWithQuestionsAndVersions = Prisma.TestGetPayload<{
  include: {
    testVersions: {
      include: {
        questions: {
          include: {
            type: true
          }
        },
      }
    },
  }
}>

// type TestFullType = Prisma.TestVersionGetPayload<{
//   include: {
//     testGroup: true,
//     questions: true
//   }
//   // include: {
//   //   questions: {
//   //     include: {
//   //       type: true
//   //     }
//   //   },
//   //   tags: true
//   // }
// }>

type TestWithQuestions = Prisma.TestVersionGetPayload<{
  include: {
    questions: true,
    testGroup: true
  }
  // include: {
  //   tests: {
  //     include: {
  //       questions: true
  //     }
  //   }
  // }
}>