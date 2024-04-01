import { redirect, type ServerLoad } from "@sveltejs/kit";
import prisma from "~/lib/prisma";

export const load: ServerLoad = async (event) => {
  const { params } = event
  const category = params.groupCategory
  const groupSlug = params.groupName

  const subcategories = await prisma.groupSubcategory.findMany({
    where: {
      slug: category,
      group: {
        slug: groupSlug
      }
    }
  })

  if (!category || !subcategories.length) {
    throw redirect(307, `/dashboard/my-groups/${groupSlug}`)
  }
  return {
    subcategory: subcategories[0]
  }
}