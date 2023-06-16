import { writable } from 'svelte/store';
import type { QuestionsDataType } from '~components/testCreator/Creator.svelte';

type TestObject = {
  title: string;
  description: string;
  questions: QuestionsDataType[];
};

export const testObject = writable({
  title: 'This is title',
  description: 'This is description',
  questions: [
    {
      id: crypto.randomUUID(),
      title: 'What is the capital of France?',
      displayType: 'Pick one',
      questionType: 'pickOne',
      questionTypeId: 'edec0330-59a3-45a9-a932-599ccf3c9fe8',
      content: {
        correctAnswerIndex: 1,
        answers: [
          {
            answer: 'Paris'
          },
          {
            answer: 'Paris'
          },
          {
            answer: 'Paris'
          }
        ]
      }
    },
    {
      id: crypto.randomUUID(),
      title: 'What facts about Earh are true ?',
      displayType: 'True/False',
      questionType: 'true/false',
      questionTypeId: '6100faf8-8f10-415d-92cd-e908828bcc25',
      content: {
        answers: [
          {
            isTrue: false,
            answer: 'Is the earth flat?'
          }
        ]
      }
    }
  ]
} as TestObject);