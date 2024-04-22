import { trpcServer } from '~helpers/trpcServer.js'

export const load = async (event) => {
  const userData = (await trpcServer(event)).getUserBySlug(event.params.user)

  return {
    streaming: {
      userData
    }
  }
}