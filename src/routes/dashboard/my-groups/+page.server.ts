import { superValidate } from "sveltekit-superforms/server"
import { fail, type ServerLoad } from "@sveltejs/kit";
import { z } from "zod";
import { groupDescriptionSchema, groupNameSchema } from "~schemas/textInput";
import { trpcServer } from "~helpers/trpcServer.js";

const schema = z.object({
  name: groupNameSchema,
  description: groupDescriptionSchema
})

export const load: ServerLoad = async () => {
  const form = await superValidate(schema)

  return { form }
}

export const actions = {
  createGroup: async (event) => {
    const form = await superValidate(event.request, schema)
    console.log("POSTED FORM")

    if (!form.valid) {
      return fail(400, { form })
    }

    (await trpcServer(event)).groups.createGroup({
      name: form.data.name,
      description: form.data.description
    })

    return { form }
  }
}