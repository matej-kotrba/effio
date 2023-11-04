import { fail, type Actions } from "@sveltejs/kit"
import { TRPCError } from "@trpc/server";
import { getHTTPStatusCodeFromError } from '@trpc/server/http';
import { trpcServer } from "~helpers/trpcServer"

export const actions: Actions = {
  deleteUsers: async (event) => {
    const formData = await event.request.formData()
    const users: string[] = []

    formData.forEach((value) => {
      users.push(value.toString())
    })

    try {

      await (await trpcServer(event)).groups.kickUsersFromGroup({
        groupSlug: event.params.name as string,
        userIds: users,
      })
      return {
        success: true
      }
    }
    catch (e) {
      if (e instanceof TRPCError) {
        return fail(getHTTPStatusCodeFromError(e), { message: e.message })
      }
      else {
        return fail(500, { message: "Something went wrong." })
      }
    }
  }
}