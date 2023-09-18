import { superValidate } from "sveltekit-superforms/server"
import { fail, type ServerLoad } from "@sveltejs/kit";
import { trpcServer } from "~helpers/trpcServer.js";
import { createGroupSchema } from "./schemas"
import { TRPCError } from "@trpc/server";

export const load: ServerLoad = async () => {
  const form = await superValidate(createGroupSchema)

  return { form }
}

export const actions = {
  createGroup: async (event) => {
    const form = await superValidate(event.request, createGroupSchema)
    console.log("POSTED FORM")

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      (await trpcServer(event)).groups.createGroup({
        name: form.data.name,
        description: form.data.description
      })
    }
    catch (e) {
      console.log("ERROR")
      if (e instanceof TRPCError) {
        return fail(400, { form, error: e.message })
      }
    }

    return { form }
  }
}