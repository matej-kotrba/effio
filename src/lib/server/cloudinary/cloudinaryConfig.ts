import { CLOUDINARY_SECRET, CLOUDINARY_API_KEY, VITE_PUBLIC_CLOUDINARY_CLOUD_NAME } from "$env/static/private"
import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: VITE_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_SECRET,
  secure: true,
})

export { cloudinary }