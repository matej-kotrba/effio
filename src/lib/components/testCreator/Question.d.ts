// Content of the question, inputType determines the type of the question and questions is an array of questions and its structure
// Apart from these two properties you can add any other properties you want for functionality of the question
type TrueFalseQuestion = {
  inputType: 'true/false';
  questions: {
    question: string;
    isTrue: boolean;
  }[];
}

type PickOneQuestion = {
  inputType: 'pickOne';
  questions: {
    question: string;
  }[];
  correctAnswerIndex: number;
};


type QuestionContent =
  | PickOneQuestion
  | TrueFalseQuestion;

type Question = {
  title: string;
  content: QuestionContent;
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