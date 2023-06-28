// Content of the question, inputType determines the type of the question and questions is an array of questions and its structure
// Apart from these two properties you can add any other properties you want for functionality of the question

type TrueFalseQuestion = {
  type: 'true/false';
  answers: (Answer & {
    isTrue: boolean;
  })[];
}

type PickOneQuestion = {
  type: 'pickOne';
  answers: Answer[];
  correctAnswerIndex: number;
};

type Answer<T = string> = {
  answer: T;
  error?: string;
}

type QuestionTypeMap = {
  'true/false': TrueFalseQuestion;
  'pickOne': PickOneQuestion;
}

type QuestionContent = QuestionTypeMap[keyof QuestionTypeMap];

type Question = {
  [Key in keyof QuestionTypeMap]: {
    id: string;
    title: string;
    displayType: string;
    questionType: Key;
    questionTypeId: string;
    content: QuestionTypeMap[Key];
    errors: {
      [ErrorKey in keyof Question as ErrorKey extends "errors" ? never : ErrorKey]?: string;
    }
  };
}[keyof QuestionTypeMap];

type ClientTest = {
  title: string;
  description: string;
  questions: Question[];
  errors: {
    title?: string;
    description?: string;
  };
}

// Type with name and its properties retrieved from DB
// IMPORTANT: cant promise typesafety becuase it is created in MySQL DB inside of JSON field
// type QuestionTemplate = {
//   name: string;
//   properties: {
//     inputType: string;
//     question: string[];
//     [key: string]: unknown;
//   };
// }