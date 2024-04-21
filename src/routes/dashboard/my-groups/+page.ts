import type { MetaTagsProps } from "~components/other/MetaTags.svelte"

export const load = ({ data }) => {
  const metaTags: MetaTagsProps = {
    title: "Effio | Groups",
    description: "View groups you are part of, create new one or join existing ones.",
  }

  return {
    ...data,
    meta: metaTags
  }
}