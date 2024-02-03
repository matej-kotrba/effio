import { json } from "@sveltejs/kit"
import { cloudinary } from "./cloudinaryConfig"

export async function deleteImageFromCloudinary(imageUrl: string, folderPath = "test") {
  const id = `${folderPath ? folderPath : "tests"}/${(imageUrl?.split("/").pop())?.split(".")[0]}`

  try {
    const result = await cloudinary.uploader.destroy(id)
  }
  catch (e) {
    return json({ success: false, error: e })
  }

  return json({ success: true })
}
