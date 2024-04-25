import { isTestValidAndSetErrorsToTestObject, isValidInputServerAndSetErrorsToTestObject, type IsTestValidProps } from "./test/test"
import type { TestObject } from "~stores/testObject";
import { get, type Writable } from "svelte/store"
import { TRPCClientError } from "@trpc/client";
import { trpc } from "../trpc/client";
import { page } from "$app/stores"
import { goto } from "$app/navigation";
import { createTRPCErrorNotification } from "../utils/notification";
import toast from "svelte-french-toast";
import { enviromentFetch } from "./fetch";
import type { TestType } from "@prisma/client";
import { questionContentFunctions } from "./test/questionFunctions";

// Awaited<
//   ReturnType<ReturnType<typeof trpc>['protected']["saveTest"]['mutate']>
// >

type Callbacks<RES, E> = {
  onSaveToDB?: (response: RES) => void;
  onErrorSaveToDB?: (e: E) => void;
}

const defaultCallbacks: Callbacks<Awaited<
  ReturnType<ReturnType<typeof trpc>['protected']["saveTest"]['mutate']> | Awaited<
    ReturnType<ReturnType<typeof trpc>['protected']["updateTest"]['mutate']>>
>, unknown> = {
  onSaveToDB: (response) => {
    if (response.success) {
      goto('/dashboard/test-collection');
    }
  },
  onErrorSaveToDB: (e) => {
    if (e instanceof TRPCClientError) {
      createTRPCErrorNotification(e);
    }
  }
}

type Props = {
  type: "create",
  data: Required<IsTestValidProps> & { testObject: Writable<TestObject>, isPublished: boolean, image?: File, testType: TestType, isRandomized: boolean },
  callbacks: Callbacks<Awaited<
    ReturnType<ReturnType<typeof trpc>['protected']["saveTest"]['mutate']>
  >, unknown>
} | {
  type: "update",
  data: Required<IsTestValidProps> & { testObject: Writable<TestObject>, isPublished: boolean, image?: File, id: string, isRandomized: boolean },
  callbacks: Callbacks<Awaited<
    ReturnType<ReturnType<typeof trpc>['protected']["updateTest"]['mutate']>
  >, unknown>
}

export const validateTestAndRecordIt = async (props: Props) => {
  if (props.callbacks.onSaveToDB === undefined) props.callbacks.onSaveToDB = defaultCallbacks.onSaveToDB
  if (props.callbacks.onErrorSaveToDB === undefined) props.callbacks.onErrorSaveToDB = defaultCallbacks.onErrorSaveToDB

  // General checks for the test
  // Setting mark system of programming test to empty object hence it is not needed
  if (props.data.isPublished === false && props.data.includedInGroups.subcategorySelect.some(item => item.id !== "")) {
    toast.error("You can't include a test in a group if it is not published")
    return
  }

  if (props.type === "create" && props.data.testType === "PROGRAMMING") props.data.markSystem = {}

  const { testObject } = props.data

  const currentStore = get(testObject);

  const result = isTestValidAndSetErrorsToTestObject({
    title: props.data.title,
    description: props.data.description,
    questions: props.data.questions,
    markSystem: props.data.markSystem,
    tagIds: props.data.tagIds,
    includedInGroups: props.data.includedInGroups
  });

  if (result['isError']) {
    currentStore.errors = result['store']['errors'];
    testObject.set(currentStore)
    if (props.callbacks.onErrorSaveToDB !== undefined) {
      props.callbacks.onErrorSaveToDB(currentStore.errors)
    }
    return;
  }

  // Sending test to the API endpoint to save it to the DB
  const serverResponse = await isValidInputServerAndSetErrorsToTestObject(testObject, {
    title: props.data.title,
    description: props.data.description,
    questions: props.data.questions,
    markSystem: props.data.markSystem,
    tagIds: props.data.tagIds,
    includedInGroups: props.data.includedInGroups
  });

  if (serverResponse.isError === true) {
    currentStore.errors = result['store']['errors'];
    testObject.set(currentStore)
    return;
  }

  // Setup the image
  let newlySavedImageUrl: string | undefined = undefined;
  if (props.data.image !== undefined && props.data.image !== null) {
    const form = new FormData()
    form.append("image", props.data.image)

    const response = await fetch("/api/cloudinary/uploadImage", {
      method: "POST",
      body: form,
      // Headers should not be set here
      // headers: {
      //   "Content-Type": "multipart/form-data"
      // }
    })

    const json: any = await response.json()
    if (json.url !== undefined) {
      newlySavedImageUrl = json.url
    }
    else if (json.error) {
      toast.error(json.error)
    }
  }

  try {
    let response;
    const questions = props.data.questions

    const imageQuestionsPromises: (ReturnType<NonNullable<typeof questionContentFunctions[keyof QuestionTypeMap]["onActionWithDB"]>> | undefined)[] = []
    for (const i in questions) {
      const questionTypeFunctionCall = questionContentFunctions[questions[i].questionType].onActionWithDB
      if (questionTypeFunctionCall) {
        imageQuestionsPromises[i] = questionTypeFunctionCall(props.type, questions[i].content as any)
      }
    }

    const awaitedImageQuestions = await Promise.all(imageQuestionsPromises)

    for (const i in awaitedImageQuestions) {
      const data = awaitedImageQuestions[i]
      if (data) {
        questions[i].content = data.transformedQuestion
      }
    }

    if (props.type === "create") {
      response = await trpc(get(page)).protected.saveTest.mutate({
        title: props.data.title,
        description: props.data.description,
        questionContent: JSON.stringify(props.data.questions),
        isPublished: props.data.isPublished,
        imageUrl: newlySavedImageUrl || undefined,
        testType: props.data.testType,
        tagIds: props.data.tagIds,
        markSystem: props.data.markSystem?.marks
          ? {
            marks: currentStore.markSystem.marks.map((item) => {
              return {
                name: item.name,
                // Checked in the isTestValidAndSetErrorsToTestObject
                limit: item.limit as number
              };
            })
          }
          : undefined,
        includedInGroups: {
          isPublic: currentStore.includedInGroups.public,
          subcategorySelect: currentStore.includedInGroups.subcategorySelect.map(item => {
            return {
              id: item.id,
              limit: item.numberOfTriesForUser || null
            }
          }),
        },
        isRandomized: props.data.isRandomized
      });
    }
    else if (props.type === "update") {
      const imageUrlToDeleteTest = await trpc(get(page)).getTestById.query({
        id: props.data.id,
      })

      if (imageUrlToDeleteTest === null) return
      response = await trpc(get(page)).protected.updateTest.mutate({
        title: props.data.title,
        description: props.data.description,
        questionContent: JSON.stringify(props.data.questions),
        isPublished: props.data.isPublished,
        imageUrl: newlySavedImageUrl || undefined,
        tagIds: props.data.tagIds,
        markSystem: props.data.markSystem?.marks
          ? {
            marks: currentStore.markSystem.marks.map((item) => {
              return {
                name: item.name,
                // Checked in the isTestValidAndSetErrorsToTestObject
                limit: item.limit as number
              };
            })
          }
          : undefined,
        includedInGroups: {
          isPublic: currentStore.includedInGroups.public,
          subcategorySelect: currentStore.includedInGroups.subcategorySelect.map(item => {
            return {
              id: item.id,
              limit: item.numberOfTriesForUser || null
            }
          })
        },
        testGroupId: currentStore.id as string,
        isRandomized: props.data.isRandomized
      });

      if (response.test && newlySavedImageUrl !== undefined) {
        enviromentFetch({
          path: "cloudinary/deleteImage",
          method: "POST",
          body: JSON.stringify({
            imageUrl: imageUrlToDeleteTest.imageUrl
          })
        })
      }
    }

    if (props.callbacks.onSaveToDB !== undefined) {
      if (props.type === "create")
        props.callbacks.onSaveToDB(response as Awaited<
          ReturnType<ReturnType<typeof trpc>['protected']["saveTest"]['mutate']>
        >)
      else if (props.type === "update")
        props.callbacks.onSaveToDB(response as Awaited<
          ReturnType<ReturnType<typeof trpc>['protected']["updateTest"]['mutate']>
        >)
    }

  } catch (e) {
    if (props.callbacks.onErrorSaveToDB !== undefined) {
      props.callbacks.onErrorSaveToDB(e)
    }
  }
}