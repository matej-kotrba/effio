import { redirect } from '@sveltejs/kit'

export const actions = {
  async logOut() {
    const query = "logout=true"
    throw redirect(302, `/?${query}`)
  }
}