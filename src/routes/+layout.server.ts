import type { LayoutServerLoad } from "./$types";

export const load: LayoutServerLoad = async (event) => {

  const hasLoggedOut = event.url.searchParams.has("logout")

  return {
    session: await event.locals.getSession(),
    hasLoggedOut
  };
};