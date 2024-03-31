import { fail, redirect } from '@sveltejs/kit'
import { superValidate } from 'sveltekit-superforms/server'
import { channelCreateSchema, deleteGroupSchema, kickUserFromGroupSchema, updateGroupSchema } from '../schemas.js'
import { trpcServer } from '~helpers/trpcServer.js'
import { TRPCError } from '@trpc/server'

export const load = async () => {
  const updateGroupForm = await superValidate(updateGroupSchema)
  const deleteGroupForm = await superValidate(deleteGroupSchema)
  const kickUserFromGroupForm = await superValidate(kickUserFromGroupSchema)

  return {
    updateGroupForm,
    deleteGroupForm,
    kickUserFromGroupForm
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
    const { fetch } = event
    const formData = await event.request.formData()
    const form = await superValidate(formData, updateGroupSchema)

    if (!form.valid) {
      return fail(400, { form })
    }

    const image = formData.get("image-upload-group")
    let newlySavedImageUrl: string | undefined = undefined

    if (image && image instanceof File && image.size > 0 && image.name !== "") {
      const uploadImageForm = new FormData()
      uploadImageForm.append("image", image)

      const response = await fetch("/api/cloudinary/uploadImage", {
        method: "POST",
        body: uploadImageForm,
      })

      const json: any = await response.json()
      if (json.url !== undefined) {
        newlySavedImageUrl = json.url
      }
      else if (json.error) {
        return fail(400, { form, error: json.error })
      }
    }

    try {
      await (await trpcServer(event)).groups.updateGroup({ ...form.data, imageUrl: newlySavedImageUrl })
    }
    catch (e) {
      if (e instanceof TRPCError) {
        return fail(400, { form, error: e.message })
      }
    }

    return { form }
  },
  deleteGroup: async (event) => {
    const formData = await event.request.formData()
    const form = await superValidate(formData, deleteGroupSchema)

    if (!form.valid) {
      return fail(400, { form })
    }

    const group = await (await trpcServer(event)).groups.getGroupById({ id: form.data.id })
    console.log(group)

    if (group === null || group.name !== form.data.validation_name) {
      return fail(400, { form, error: "Group name does not match" })
    }

    try {
      await (await trpcServer(event)).groups.deleteGroup(form.data)
    }
    catch (e) {
      if (e instanceof TRPCError) {
        return fail(400, { form, error: e.message })
      }
    }
    throw redirect(304, "/dashboard/my-groups")
  },
  kickUser: async (event) => {
    const formData = await event.request.formData()
    const form = await superValidate(formData, kickUserFromGroupSchema)

    if (!form.valid) {
      return fail(400, { form })
    }

    console.log(form.data)
    // const group = await (await trpcServer(event)).groups.getGroupById({ id: form.data.id })
    // console.log(group)

    // if (group === null || group.name !== form.data.validation_name) {
    //   return fail(400, { form, error: "Group name does not match" })
    // }

    // try {
    //   await (await trpcServer(event)).groups.deleteGroup(form.data)
    // }
    // catch (e) {
    //   if (e instanceof TRPCError) {
    //     return fail(400, { form, error: e.message })
    //   }
    // }

    return { form }
  }
}