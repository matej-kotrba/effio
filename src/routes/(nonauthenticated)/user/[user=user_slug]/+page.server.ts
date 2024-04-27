import { trpcServer } from '~helpers/trpcServer.js'

export const load = async (event) => {
  const session = (await event.locals.getSession()) as UpdatedSession
  const trpc = (await trpcServer(event))

  const userData = trpc.getUserBySlug(event.params.user)
  const userTests = trpc.getUserTestsById({
    id: session?.user?.id || "",
    limit: 8,
    isPublished: true,
  })

  return {
    streaming: {
      userData,
      userTests
    }
  }
}