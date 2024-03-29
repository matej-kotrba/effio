import { fail } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { channelCreateSchema, updateGroupSchema } from '../schemas.js'
import { trpcServer } from '~helpers/trpcServer.js'
import { TRPCError } from '@trpc/server'

export const load = async () => {
  const updateGroupForm = await superValidate(updateGroupSchema)

  return {
    updateGroupForm
  }
}

export const actions = {
  createChannel: async (event) => {
    const formData = await event.request.formData()
    const form = await superValidate(formData, channelCreateSchema)

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      await (await trpcServer(event)).groups.createChannel(form.data)
    }
    catch (e) {
      if (e instanceof TRPCError) {
        return fail(400, { form, error: e.message })
      }
    }

    return { form }
  },
  updateGroup: async (event) => {
    const formData = await event.request.formData()
    const form = await superValidate(formData, updateGroupSchema)

    if (!form.valid) {
      return fail(400, { form })
    }
    console.log(form.data)
    // const uploadImageForm = new FormData()
    // uploadImageForm.append("image", form.data.image)

    // const response = await fetch("/api/cloudinary/uploadImage", {
    //   method: "POST",
    //   body: uploadImageForm,
    // })

    // const json: any = await response.json()
    // if (json.url !== undefined) {
    //   newlySavedImageUrl = json.url
    // }
    // else if (json.error) {
    //   toast.error(json.error)
    // }

    // try {
    //   await (await trpcServer(event)).groups.updateGroup(form.data)
    // }
    // catch (e) {
    //   if (e instanceof TRPCError) {
    //     return fail(400, { form, error: e.message })
    //   }
    // }

    return { form }
  }
}