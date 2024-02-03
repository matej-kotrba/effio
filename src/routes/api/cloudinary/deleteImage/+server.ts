import { error } from '@sveltejs/kit'
import { deleteImageFromCloudinary } from '~/lib/server/cloudinary/utils.js'
import { checkRequestOrigin } from '~/lib/server/utils/endpoints.js'

export const POST = async (event) => {
  console.log("RUNNING")
  // checkRequestOrigin(event)
  const { request } = event

  const data = await request.json()

  if (!data) {
    throw error(400, {
      message: "No body provided"
    })
  }

  const { imageUrl, folderPath } = data as { imageUrl: string | undefined, folderPath: string | undefined }

  if (!imageUrl) {
    throw error(400, {
      message: "No image url provided"
    })
  }

  return deleteImageFromCloudinary(imageUrl, folderPath)
}