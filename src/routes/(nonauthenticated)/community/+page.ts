import type { MetaTagsProps } from "~components/other/MetaTags.svelte"

export const load = ({ data }) => {
  const metaTags: MetaTagsProps = {
    title: "Effio | Community",
    description: "Explore tests of others, rate them and have fun.",
  }

  return {
    ...data,
    meta: metaTags
  }
}