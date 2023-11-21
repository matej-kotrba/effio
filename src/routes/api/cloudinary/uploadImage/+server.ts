import { json } from "@sveltejs/kit"
import { cloudinary } from "~/lib/server/cloudinary/cloudinaryConfig"
import { IMAGE_IMPORT_SIZE_IN_MB } from "~helpers/constants"

export const POST = async ({ request }) => {
  const formData = await request.formData()
  const image = formData.get("image")

  console.log(request)
  console.log(formData)
  console.log(image)

  if (!image) {
    return json({
      error: "No image provided"
    }, {
      status: 400
    })
  }

  const ALLOWED_IMAGE_TYPES = ["png", "jpg", "jpeg", "avif", "webp"]

  let uploadStream: any;

  if (image instanceof File) {
    if (image.size > IMAGE_IMPORT_SIZE_IN_MB * 1024 * 1024) {
      return json({
        error: `Image is larger than ${IMAGE_IMPORT_SIZE_IN_MB}MB`
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
      cloudinary.uploader.upload_stream({ allowed_formats: ["png", "jpg", "jpeg", "webp"], folder: "tests" }, (error, result) => {
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

  return json({
    url: uploadStream?.url
  })
}