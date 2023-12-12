import { json } from "@sveltejs/kit"
import type { RequestHandler } from "./$types"
import prisma from "~/lib/prisma"

export const GET: RequestHandler = async ({ url, locals }) => {
  const session = await locals.getSession() as UpdatedSession
  if (session.user?.id !== "cllo43xes0000mo083eunwncf" && session.user?.id !== "cllpeoksw0000l9084sm98h4g") {
    return json({
      error: "You are not authorized to access this page"
    })
  }
  const count = url.searchParams.get("count")

  await prisma.test.createMany({
    data: Array.from({ length: Number(count) }, (_, i) => {
      return {
        title: "Example test " + i,
        description: "This is an example test",
        ownerId: session.user!.id!,
      }
    })
  })

  return json({
    text: count
  })
}