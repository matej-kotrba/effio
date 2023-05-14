import type { Action } from "svelte/types/runtime/action/index"

export const clickOutside: Action<HTMLElement> = (node: HTMLElement) => {
  function onClick(event: MouseEvent) {
    if (!node.contains(event.target as Node)) {
      node.dispatchEvent(new CustomEvent('clickOutside', { detail: event }))
    }
  }

  window.addEventListener('click', onClick, true)
  return {
    destroy() {
      window.removeEventListener('click', onClick, true)
    }
  }
}