import type { Action } from "svelte/types/runtime/action/index"
import { browser } from "$app/environment"

let observer: IntersectionObserver | null = null

if (browser) {
  observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.dispatchEvent(new CustomEvent('intersect'))
      }
      else {
        entry.target.dispatchEvent(new CustomEvent('unintersect'))
      }
    })
  }, {
    threshold: 0.25,
    rootMargin: '-200px'
  })
}

// Adds intersection observer for provided element
// On intersect observer will dispatch intersect event
export const intersection: Action<HTMLElement> = (node: HTMLElement) => {
  observer?.observe(node)

  return {
    destroy() {
      observer?.unobserve(node)
    }
  }
}

export function onIntersect(event: CustomEvent<IntersectionObserverEntry>, classesToApply: string[]) {
  if (event.target) {
    for (const item of classesToApply) {
      (event.target as HTMLElement).classList.add(item)
    }
  }
}

export function onUnintersect(event: CustomEvent<IntersectionObserverEntry>, classesToApply: string[]) {
  if (event.target) {
    for (const item of classesToApply) {
      (event.target as HTMLElement).classList.remove(item)
    }
  }
}