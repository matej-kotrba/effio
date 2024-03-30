import { error, json } from '@sveltejs/kit'
import { deleteImageFromCloudinary } from '~/lib/server/cloudinary/utils.js'
import { checkRequestOrigin } from '~/lib/server/utils/endpoints.js'

export const POST = async (event) => {
  try {
    checkRequestOrigin(event)
  }
  catch (e) {
    return json("You are not allowed to delete images")
  }
  const { request } = event

  const data = await request.json()

  if (!data) {
    return json({
      message: "No body provided"
    })
  }

  const { imageUrl, folderPath } = data as { imageUrl: string | undefined, folderPath: string | undefined }

  if (!imageUrl) {
    return json({
      message: "No image url provided"
    })
  }

  return deleteImageFromCloudinary(imageUrl, folderPath)
}