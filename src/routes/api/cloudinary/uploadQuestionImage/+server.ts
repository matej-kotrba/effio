import { json } from "@sveltejs/kit"
import { cloudinary } from "~/lib/server/cloudinary/cloudinaryConfig"
import { ALLOWED_IMAGE_TYPES, IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB } from "~helpers/constants"

export const POST = async ({ request, locals }) => {
  const session = await locals.getSession()
  if (!session?.user?.name) return json({
    error: "You are not allowed to upload images"
  }, {
    status: 400
  })

  const formData = await request.formData()
  const image = formData.get("image")

  if (!image) {
    return json({
      error: "No image provided"
    }, {
      status: 400
    })
  }

  let uploadStream: any;

  if (image instanceof File) {
    if (image.size > IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB * 1024 * 1024) {
      return json({
        error: `Image is larger than ${IMAGE_QUESTION_TYPE_PICTURE_SIZE_IN_MB}MB`
      }, {
        status: 400
      })
    }
    else if (!ALLOWED_IMAGE_TYPES.includes(image.type.split("/")[1])) {
      return json({
        error: "Image is not a valid type"
      }, {
        status: 400
      })
    }
    const arrayBuffer = await image.arrayBuffer()
    const buffer = new Uint8Array(arrayBuffer)
    uploadStream = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({ allowed_formats: ALLOWED_IMAGE_TYPES, folder: "questions" }, (error, result) => {
        if (error) {
          return reject(error)
        }
        return resolve(result)
      })
        .end(buffer)
    })
  }
  else if (image !== undefined) {
    return json({
      error: "File is not an image"
    }, {
      status: 400
    })
  }
  if (!uploadStream) {
    return json("")
  }

  return json({
    url: uploadStream.secure_url ? uploadStream.secure_url : uploadStream.url
  })
}