import { generateGIFT, type GIFTQuestion } from "gift-format-generator";
import type { TestFullType } from "~/Prisma";

export function createExportedFileAndMakeItDownloadable(test: TestFullType) {
  return generateGIFT(
    test.testVersions[0]['questions'].map((question) => {
      let questionType;
      let content: GIFTQuestion['answers'];
      console.log(question);

      switch (question['type']['slug'] as keyof QuestionTypeMap) {
        case 'pickOne': {
          questionType = 'SC' as const;

          const questionContent = question['content'] as PickOneQuestion;
          content = questionContent.answers.map((answer, index) => {
            return {
              text: answer.answer,
              isCorrect: index === questionContent.correctAnswerIndex
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
          throw new Error('Unknown question type');
        }
      }

      return {
        title: question.title,
        questionName: question.title,
        formatter: 'plain',
        type: questionType,
        answers: content
      };
    })
  );
}