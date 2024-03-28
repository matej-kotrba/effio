import { superValidate } from "sveltekit-superforms/server"
import { fail, error, type ServerLoad } from "@sveltejs/kit";
import { trpcServer } from "~helpers/trpcServer.js";
import { createGroupSchema, joinGroupSchema } from "./schemas"
import { TRPCError } from "@trpc/server";
import { IMAGE_IMPORT_SIZE_IN_MB } from "~helpers/constants";
import { cloudinary } from "~/lib/server/cloudinary/cloudinaryConfig"

export const load: ServerLoad = async (event) => {
  const form = await superValidate(createGroupSchema)
  const joinForm = await superValidate(joinGroupSchema)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const id = (await event.locals.getSession())?.user.id

  if (!id) throw error(401, "Unauthorized")

  const groups = await (await trpcServer(event)).groups.getGroupsByUserId({
    id: id,
    alsoUser: true,
    includeUsers: false
  })

  return { form, joinForm, groups }
}

export const actions = {
  createGroup: async (event) => {
    const formData = await event.request.formData()
    const form = await superValidate(formData, createGroupSchema)

    if (!form.valid) {
      return fail(400, { form })
    }

    // Pushing image to cloudinary
    const ALLOWED_IMAGE_TYPES = ["png", "jpg", "jpeg", "avif", "webp"]

    const image = formData.get("image")

    let uploadStream: any;

    if (image instanceof File) {
      if (image.size > IMAGE_IMPORT_SIZE_IN_MB * 1024 * 1024) {
        return fail(400, { form, error: "Image is too large" })
      }
      else if (!ALLOWED_IMAGE_TYPES.includes(image.type.split("/")[1])) {
        return fail(400, { form, error: "Image is not a valid type" })
      }
      const arrayBuffer = await image.arrayBuffer()
      const buffer = new Uint8Array(arrayBuffer)
      uploadStream = await new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ allowed_formats: ["png", "jpg", "jpeg", "webp"], folder: "groups" }, (error, result) => {
          if (error) {
            return reject(error)
          }
          return resolve(result)
        })
          .end(buffer)
      })
    }
    else if (image !== undefined) {
      return fail(400, { form, error: "Image is not a file" })
    }
    try {
      await (await trpcServer(event)).groups.createGroup({
        name: form.data.name,
        description: form.data.description,
        imageUrl: uploadStream.secure_url ? uploadStream.secure_url : uploadStream.url,
      })
    }
    catch (e) {
      if (e instanceof TRPCError) {
        return fail(400, { form, error: e.message })
      }
    }

    return { form }
  },
  joinGroup: async (event) => {
    const form = await superValidate(event.request, joinGroupSchema)

    if (!form.valid) {
      return fail(400, { form })
    }

    try {
      await (await trpcServer(event)).groupInvites.joinGroupWithInvite({
        inviteCode: form.data.code
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