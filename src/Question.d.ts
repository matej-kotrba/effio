// Content of the question, inputType determines the type of the question and questions is an array of questions and its structure
// Apart from these two properties you can add any other properties you want for functionality of the question
type TrueFalseQuestion = {
  asnwers: {
    asnwer: string;
    isTrue: boolean;
  }[];
}

type PickOneQuestion = {
  answers: {
    asnwer: string;
  }[];
  correctAnswerIndex: number;
};

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
  };
}[keyof QuestionTypeMap];

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