import type { MetaTagsProps } from "~components/other/MetaTags.svelte"

export const load = ({ data }) => {
  const metaTags: MetaTagsProps = {
    title: "Effio | Test Creator",
    description: "Create a new quiz or programming test in user friendly editor, attach details and publish it for others to enjoy.",
  }

  return {
    ...data,
    meta: metaTags
  }
}