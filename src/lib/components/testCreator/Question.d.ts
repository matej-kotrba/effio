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

type QuestionType = {
  name: string;
  properties: QuestionContent;
}