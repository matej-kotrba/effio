// Content of the question, inputType determines the type of the question and questions is an array of questions and its structure
// Apart from these two properties you can add any other properties you want for functionality of the question
type QuestionContent =
  | {
    inputType: 'true/false';
    questions: {
      question: string;
      answer: boolean;
    }[];
  }
  | {
    inputType: 'pickOne';
    questions: {
      question: string;
    }[];
    correctAnswerIndex: number;
  };

// Type with name and its properties retrieved from DB
// IMPORTANT: cant promise typesafety becuase it is created in MySQL DB inside of JSON field
type QuestionType = {
  name: string;
  properties: JSON;
}