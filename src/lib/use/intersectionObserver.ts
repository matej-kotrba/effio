import type { Action } from "svelte/action"
import { browser } from "$app/environment"

let observer: IntersectionObserver | null = null
let observerOnce: IntersectionObserver | null = null

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
    threshold: 0.8,
    rootMargin: '-0px',
  })

  observerOnce = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.dispatchEvent(new CustomEvent('intersect'))
        observerOnce?.unobserve(entry.target)
      }
    })
  },
    {
      threshold: 0.8,
    })
}
// Adds intersection observer for provided element
// On intersect observer will dispatch intersect event
export const intersection: Action<HTMLElement, any> = (node: HTMLElement, once: boolean | undefined) => {
  if (!once) observer?.observe(node)
  else observerOnce?.observe(node)

  // TODO: This may not work 
  return {
    destroy() {
      if (!once) observer?.unobserve(node)
      else observerOnce?.unobserve(node)
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

// V2 of intersection observer

export const intersect = (node: Element, options: (IntersectionObserverInit & { once?: boolean }) = {}) => {
  const intersectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.dispatchEvent(new CustomEvent('intersect'))
        if (options?.once) intersectionObserver.unobserve(entry.target)
      }
      else {
        entry.target.dispatchEvent(new CustomEvent('unintersect'))
      }
    })
  }, options)

  intersectionObserver.observe(node)

  return {
    destroy() {
      intersectionObserver.unobserve(node)
      intersectionObserver.disconnect()
    }
  }
}