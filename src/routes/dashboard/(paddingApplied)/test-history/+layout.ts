import type { MetaTagsProps } from "~components/other/MetaTags.svelte"

export const load = () => {
  const metaTags: MetaTagsProps = {
    title: "Effio | Test History",
    description: "View your test history with ability to display detailed results.",
  }

  return {
    meta: metaTags
  }
}