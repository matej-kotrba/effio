import type { Action } from "svelte/action"

// On clicking outside of the element, dispatch a custom event - 'clickOutside'
export const clickOutside: Action<HTMLElement> = (node: HTMLElement) => {
  function onClick(event: MouseEvent) {
    if (!node.contains(event.target as Node)) {
      node.dispatchEvent(new CustomEvent('clickoutside', { detail: event }))
    }
  }

  window.addEventListener('click', onClick, true)
  return {
    destroy() {
      window.removeEventListener('click', onClick, true)
    }
  }
}