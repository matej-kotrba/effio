import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { channelCreateSchema } from '../schemas.js'
import { trpcServer } from '~helpers/trpcServer.js'
import { TRPCError } from '@trpc/server'

export const actions = {
  createChannel: async (event) => {
    const formData = await event.request.formData()
    const form = await superValidate(formData, channelCreateSchema)
    console.log("asdasd", form.data)

    return fail(400, { form })
    console.log(form.data)
    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      await (await trpcServer(event)).groups.createChannel({
        groupId: form.data.id,
        channel: {
          name: form.data.name
        }
      })
    }
    catch (e) {
      if (e instanceof TRPCError) {
        return fail(400, { form, error: e.message })
      }
    }

    return { form }
  },
}