import type { User } from "@prisma/client"
import { json, type RequestHandler } from "@sveltejs/kit"
import prisma from "~/lib/prisma"
import { randomId } from "~helpers/randomId"

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await locals.getSession() as UpdatedSession
  if (session.user?.role !== "ADMIN") {
    return json({
      error: "You are not authorized to access this page"
    })
  }
  const count = url.searchParams.get("count")

  await prisma.user.createMany({
    data: Array.from({ length: Number(count) }, (_, i) => {
      const id = randomId()
      return {
        email: `${id}@email.com`,
        name: id,
        role: "USER"
      } satisfies PartialPick<User, "id" | "emailVerified" | "image">
    })
  })

  return json({
    text: count
  })
}