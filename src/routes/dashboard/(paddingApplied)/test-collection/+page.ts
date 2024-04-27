import type { MetaTagsProps } from "~components/other/MetaTags.svelte"

export const load = () => {
  const metaTags: MetaTagsProps = {
    title: "Effio | Test collection",
    description: "Browser your tests, edit them and apply filters.",
  }

  return {
    meta: metaTags
  }
}