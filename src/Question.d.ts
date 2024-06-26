// Content of the question, inputType determines the type of the question and questions is an array of questions and its structure
// Apart from these two properties you can add any other properties you want for functionality of the question

type PickOneQuestion = {
  type: "pickOne";
  answers: Answer[];
  correctAnswerId: number | undefined;
};

type TrueFalseQuestion = {
  type: "trueFalse";
  answers: (Answer & {
    isTrue: boolean;
  })[];
}

type ConnectQuestion = {
  type: "connect";
  answers: (Answer & {
    matchedAnswerIndex: string | undefined;
  })[];
  matchedAnswers: {
    [key: string]: {
      answer: string;
      displayId: number;
      error?: string;
    };
  }
}

type WriteQuestion = {
  type: "write";
  wordCount?: number;
  answers: Answer[];
}

type FillQuestion = {
  type: "fill";
  answers: Answer<{
    precedent: string;
    options: string[];
    sequent: string;
    errors: {
      precedent?: string;
      sequent?: string;
      options: string[
      ];
    }
  }>[];
}

type GeographyLocation = [number, number]

type GeographyQuestion = {
  type: "geography";
  initial: {
    location: GeographyLocation;
    zoom: number;
    errors?: [string?, string?]
  },
  tolerence: number,
  answerPoint: {
    location: GeographyLocation;
    errors?: [string?, string?]
  },
  errors?: {
    tolerence?: string;
  }
}

type ImageQuestion = {
  type: "image";
  imageUrl?: string;
  imageFile?: File;
  correctAnswerId?: number;
  answers: Answer[];
}

type BitmapQuestion = {
  type: "bitmap";
  imageUrl?: string;
  imageFile?: File;
  zoom: number;
  tolerence: number,
  answerPoint: {
    location: GeographyLocation;
    errors?: [string?, string?]
  },
  errors?: {
    tolerence?: string;
  }
}

type ProgrammingQuestion = {
  type: "programming",
  description: string,
  code: string,
  language: "js",
  tests: {
    input: string,
    output: string,
    error?: string,
  }[],
  hints: string[],
  errors: {
    description?: string,
    code?: string,
    language?: string,
    tests?: {
      input?: string,
      output?: string,
    }[],
    hints?: string[],
  }
}

type Answer<T = string> = {
  answer: T;
  id: number;
  response?: string;
  error?: string;
}

type QuestionTypeMap = {
  "pickOne": PickOneQuestion;
  "trueFalse": TrueFalseQuestion;
  "connect": ConnectQuestion;
  "write": WriteQuestion;
  "fill": FillQuestion;
  "geography": GeographyQuestion;
  "image": ImageQuestion;
  "programming": ProgrammingQuestion;
  "bitmap": BitmapQuestion
}

type QuestionContent = QuestionTypeMap[keyof QuestionTypeMap];

type QuestionClient = {
  [Key in keyof QuestionTypeMap]: {
    id: string;
    title: string;
    displayType: string;
    questionType: Key;
    questionTypeId: string;
    content: QuestionTypeMap[Key];
    points: number;
    errors: {
      [ErrorKey in keyof QuestionClient as ErrorKey extends "errors" ? never : ErrorKey]?: string;
    } & { global?: string }
  };
}[keyof QuestionTypeMap];

type ClientTest = {
  title: string;
  description: string;
  questions: QuestionClient[];
  errors: {
    title?: string;
    description?: string;
    markSystem?: {
      [Key in keyof MarkSystemJSON as Key extends "marks" ? never : Key]?: string;

    } & {
      marks: {
        [Key in keyof MarkSystemJSON["marks"][number]]?: string;
      }[]
    };
    tagIds?: string[];
  };
}

type QuestionServerCheckResponse<T extends QuestionContent> = {
  isCorrect: boolean | "partial";
  correctAnswer: T;
  userAnswer: T;
}

type MarkSystemJSON = { [key: string]: never } | {
  marks: {
    name: string;
    limit?: number;
  }[],
  message?: string;
}

type MarkSystemInputUse = undefined | MarkSystemJSON["marks"]

type GroupSelect = {
  id: string;
  numberOfTriesForUser: number | null;
  numberOfTriesForUserError?: string;
}

type IncludedInGroups = {
  public: boolean;
  subcategorySelect: GroupSelect[];
}

type TagIds = string[]

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