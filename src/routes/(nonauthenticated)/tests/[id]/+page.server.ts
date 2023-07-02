import { redirect, type ServerLoad } from "@sveltejs/kit";
import { router } from "~/lib/trpc/router";
import { createContext } from "~/lib/trpc/context"
import { questionContentFunctions } from "~helpers/test";




export const load: ServerLoad = async (request) => {

  const id = request.params.id;

  if (!id) throw redirect(302, "/")

  const context = await createContext(request)

  const test = await router.createCaller(context).getTestById({ id: id });

  if (!test) throw redirect(302, "/")

  const questionTypeOptions = Object.keys(questionContentFunctions)

  const editedQuestions = test.questions.map((question) => {
    // check if the question type exists in the object above, if so then redirect to homepage
    if (!questionTypeOptions.some((key) => key === question.type.slug)) throw redirect(302, "/")
    return {
      ...question,
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      content: questionContentFunctions[question.type.slug as keyof QuestionTransformation]["separateAnswer"](question.content)
    }
  })

  return {
    testContent: {
      ...test,
      questions: editedQuestions
    }
  }
}