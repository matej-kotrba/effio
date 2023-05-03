import type { Action } from "svelte/types/runtime/action/index"

let observer = new IntersectionObserver((entries) => {

})

const addIntersectionObserver: Action<HTMLElement> = (node: HTMLElement, callback: Function) => {
  observer.observe(node)

  return {
    destroy() {
      observer.unobserve(node)
    }
  }
}