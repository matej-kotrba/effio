import type { Action } from "svelte/types/runtime/action/index"

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.dispatchEvent(new CustomEvent('intersect'))
    }
  })
})

export const addIntersectionObserver: Action<HTMLElement> = (node: HTMLElement) => {
  observer.observe(node)

  return {
    destroy() {
      observer.unobserve(node)
    }
  }
}