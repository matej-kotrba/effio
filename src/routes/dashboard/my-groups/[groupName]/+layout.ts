import type { MetaTagsProps } from "~components/other/MetaTags.svelte"

export const load = ({ data }) => {
  const metaTags: MetaTagsProps = {
    title: `Effio | Group`,
    description: "Chat with other parts of the group, share tests and more.",
  }

  return {
    ...data,
    meta: metaTags
  }
}