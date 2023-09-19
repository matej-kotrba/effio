import type { PageLoad } from "./$types";
import { browser } from "$app/environment";
import { trpc } from "~/lib/trpc/client";
import { page } from "$app/stores"

export const load: PageLoad = ({ params }) => {

  // const groupFullData = browser ? trpc().groups.getGroupByName.query({
  //   name: params.name
  // })

  // return
}