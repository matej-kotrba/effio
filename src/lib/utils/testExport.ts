import { generateGIFT, type GIFTQuestion } from "gift-format-generator";
import type { TestFullType } from "~/Prisma";

export function createExportedFileAndMakeItDownloadable(test: TestFullType) {
  const allowedTypes = ['pickOne', 'true/false', 'connect', 'write'] as const;
  const data = test.testVersions[0]['questions'].filter(question => allowedTypes.includes(question.type.slug)).map((question) => {
    let questionType;
    let content: GIFTQuestion['answers'];

    switch (question['type']['slug'] as keyof QuestionTypeMap) {
      case 'pickOne': {
        questionType = 'SC' as const;

        const questionContent = question['content'] as PickOneQuestion;
        content = questionContent.answers.map((answer) => {
          return {
            text: answer.answer,
            isCorrect: answer.id === questionContent.correctAnswerId
          };
        });
        break;
      }
      case 'true/false': {
        questionType = 'MC' as const;

        const questionContent = question['content'] as TrueFalseQuestion;
        content = questionContent.answers.map((answer) => {
          return {
            text: answer.answer,
            isCorrect: answer.isTrue
          };
        });
        break;
      }
      case 'connect': {
        questionType = 'CA' as const;

        const questionContent = question['content'] as ConnectQuestion;
        content = questionContent.answers.map((answer) => {
          if (answer.matchedAnswerIndex === undefined) {
            throw new Error(
              'There has been issue with creating your file.'
            );
          }
          return {
            text: answer.answer,
            answerPart:
              questionContent.matchedAnswers[answer.matchedAnswerIndex]
                .answer
          };
        });
        break;
      }
      case 'write': {
        questionType = 'SA' as const;

        const questionContent = question['content'] as ConnectQuestion;
        content = questionContent.answers.map((answer) => {
          return {
            text: answer.answer
          };
        });
        break;
      }
      default: {
        return
      }
    }

    return {
      title: question.title,
      questionName: question.title,
      formatter: 'plain',
      type: questionType,
      answers: content
    };
  }).filter(question => question?.type !== undefined) as NonNullable<GIFTQuestion>[];

  return {
    notUsedQuestionsCount: test.testVersions[0]['questions'].length - data.length,
    generatedGIFT: generateGIFT(data)
  }
}