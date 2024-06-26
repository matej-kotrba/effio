import { getContext, setContext } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export type TestObject = {
  title: string;
  description: string;
  id?: string;
  versionId?: string;
  published?: boolean;
  questions: QuestionClient[];
  markSystem: MarkSystemJSON;
  tagIds: TagIds;
  randomizeQuestionOrder?: boolean;
  includedInGroups: IncludedInGroups;
  errors: ClientTest["errors"]
};

// export const testObject = writable<TestObject>();

const TEST_CTX = "TEST_CTX"

export function setTestObject(initialData: TestObject | { [key: string]: never }) {
  const testObject = writable(initialData)
  setContext(TEST_CTX, testObject)
  return testObject
}

export function getTestObject() {
  return getContext<Writable<TestObject>>(TEST_CTX)
}

// {
//   title: 'This is title',
//     description: 'This is description',
//       errors: { },
//   questions: [
//     {
//       id: crypto.randomUUID(),
//       title: 'What is the capital of France?',
//       displayType: 'Pick one',
//       questionType: 'pickOne',
//       questionTypeId: 'edec0330-59a3-45a9-a932-599ccf3c9fe8',
//       content: {
//         correctAnswerIndex: 1,
//         answers: [
//           {
//             answer: 'PRAHAAAA'
//           },
//           {
//             answer: 'Paris'
//           },
//           {
//             answer: 'Paris'
//           }
//         ]
//       },
//       errors: {}
//     },
//     {
//       id: crypto.randomUUID(),
//       title: 'What facts about Earh are true ?',
//       displayType: 'True/False',
//       questionType: 'true/false',
//       questionTypeId: '6100faf8-8f10-415d-92cd-e908828bcc25',
//       content: {
//         answers: [
//           {
//             isTrue: false,
//             answer: 'Is the earth flat?'
//           }
//         ]
//       },
//       errors: {}
//     }
//   ]
// } as TestObject

// export const testUpdateObject = writable<Omit<TestWithQuestions, "ownerId" | "stars" | "createdAt" | "updatedAt">>()