import { isTestValidAndSetErrorsToTestObject, isValidInputServerAndSetErrorsToTestObject, type IsTestValidProps } from "./test"
import { testObject } from "~stores/testObject";
import { get } from "svelte/store"
import { TRPCClientError } from "@trpc/client";
import { trpc } from "../trpc/client";
import { page } from "$app/stores"
import { goto } from "$app/navigation";
import { createTRPCErrorNotification } from "../utils/notification";

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
  data: Required<IsTestValidProps> & { isPublished: boolean },
  callbacks: Callbacks<Awaited<
    ReturnType<ReturnType<typeof trpc>['protected']["saveTest"]['mutate']>
  >, unknown>
} | {
  type: "update",
  data: Required<IsTestValidProps> & { isPublished: boolean },
  callbacks: Callbacks<Awaited<
    ReturnType<ReturnType<typeof trpc>['protected']["updateTest"]['mutate']>
  >, unknown>
}

export const validateTestAndRecordIt = async (props: Props) => {
  if (props.callbacks.onSaveToDB === undefined) props.callbacks.onSaveToDB = defaultCallbacks.onSaveToDB
  if (props.callbacks.onErrorSaveToDB === undefined) props.callbacks.onErrorSaveToDB = defaultCallbacks.onErrorSaveToDB

  const currentStore = get(testObject);
  console.log(props)
  const result = isTestValidAndSetErrorsToTestObject({
    title: props.data.title,
    description: props.data.description,
    questions: props.data.questions,
    markSystem: props.data.markSystem
  });

  if (result['isError']) {
    currentStore.errors = result['store']['errors'];
    testObject.set(currentStore)
    return;
  }

  const serverResponse = await isValidInputServerAndSetErrorsToTestObject({
    title: props.data.title,
    description: props.data.description,
    questions: props.data.questions,
    markSystem: props.data.markSystem
  });

  if (serverResponse.isError === true) {
    currentStore.errors = result['store']['errors'];
    testObject.set(currentStore)
    return;
  }

  let action;
  if (props.type === "create") {
    action = trpc(get(page)).protected.saveTest.mutate;
  }
  else if (props.type === "update") {
    action = trpc(get(page)).protected.updateTest.mutate;
  }
  else return;

  try {
    const response = await action({
      title: props.data.title,
      description: props.data.description,
      questionContent: JSON.stringify(props.data.questions),
      isPublished: props.data.isPublished,
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
      includedInGroups: currentStore.includedInGroups,
      testGroupId: currentStore.id as string
    });
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