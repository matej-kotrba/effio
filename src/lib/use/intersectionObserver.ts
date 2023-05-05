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
    threshold: 0.1,
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

export function onIntersect(event: CustomEvent<IntersectionObserverEntry>, classesToApply: string) {
  if (event.target) {
    (event.target as HTMLElement).classList.add(classesToApply)
  }
}

export function onUnintersect(event: CustomEvent<IntersectionObserverEntry>, classesToApply: string) {
  if (event.target) {
    (event.target as HTMLElement).classList.remove(classesToApply)
  }
}