import { fail, json } from '@sveltejs/kit'
import { cloudinary } from "~/lib/server/cloudinary/cloudinaryConfig"
import { checkRequestOrigin } from '~/lib/server/utils/endpoints.js'

export const POST = async (event) => {
  checkRequestOrigin(event)
  const { request } = event

  const data = await request.json()

  if (!data) {
    fail(400, {
      message: "No body provided"
    })
  }


  const { imageUrl, folderPath } = data as { imageUrl: string | undefined, folderPath: string | undefined }
  if (!imageUrl) {
    fail(400, {
      message: "No image url provided"
    })
  }

  const id = `${folderPath ? folderPath : "tests"}/${(imageUrl?.split("/").pop())?.split(".")[0]}`

  try {
    const result = await cloudinary.uploader.destroy(id)
  }
  catch (e) {
    return json({ success: false, error: e })
  }

  return json({ success: true })
}