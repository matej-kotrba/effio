import type { MetaTagsProps } from "~components/other/MetaTags.svelte"

export const load = ({ data }) => {
  const metaTags: MetaTagsProps = {
    title: "Effio | Dashboard",
    description: "View your recent activity and explore your statistics with visualizing charts and graphs.",
  }

  return {
    ...data,
    meta: metaTags
  }
}