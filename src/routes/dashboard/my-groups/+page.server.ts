import { superValidate } from "sveltekit-superforms/server"
import { fail, error, type ServerLoad } from "@sveltejs/kit";
import { trpcServer } from "~helpers/trpcServer.js";
import { createGroupSchema } from "./schemas"
import { TRPCError } from "@trpc/server";

export const load: ServerLoad = async (event) => {
  const form = await superValidate(createGroupSchema)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const id = (await event.locals.getSession())?.user.id

  if (!id) throw error(401, "Unauthorized")

  const groups = await (await trpcServer(event)).groups.getGroupsByUserId({
    id: id,
    alsoUser: true,
    includeUsers: false
  })

  return { form, groups }
}

export const actions = {
  createGroup: async (event) => {
    const form = await superValidate(event.request, createGroupSchema)
    console.log("POSTED FORM")

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      await (await trpcServer(event)).groups.createGroup({
        name: form.data.name,
        description: form.data.description
      })
    }
    catch (e) {
      if (e instanceof TRPCError) {
        return fail(400, { form, error: e.message })
      }
    }

    return { form }
  }
}