import type { Action } from "svelte/types/runtime/action/index"

export const dropdown: Action<HTMLElement> = (node, text) => {
  const divDropdown = window.document.createElement("div")
  divDropdown.classList.add("dropdown")
  divDropdown.classList.add("absolute")
  divDropdown.classList.add("pointer-events-none")

  divDropdown.innerHTML = `
    <div class="btn bg-light_text_black dark:bg-dark_light_grey text-white dropdown-toggle duration-150 text-body1" type="button" data-toggle="dropdown" aria-expanded="false">
      ${text}
    </div>
  `


  window.document.querySelector("body")?.appendChild(divDropdown)
  const rect = divDropdown.getBoundingClientRect()


  function onHover(e: MouseEvent) {
    divDropdown.style.top = `${e.clientY - rect.height - 10}px`
    divDropdown.style.left = `${e.clientX - rect.width / 2}px`
  }

  function appear() {
    divDropdown.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: "forwards" })
  }

  function disappear() {
    divDropdown.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 150, fill: "forwards" })
  }

  node.addEventListener("mouseenter", appear)
  node.addEventListener("mouseleave", disappear)
  node.addEventListener("mousemove", onHover)

  return {
    destroy() {
      window.document.querySelector("body")?.removeChild(divDropdown)
      node.removeEventListener("mousemove", onHover)
      node.removeEventListener("mouseenter", appear)
      node.removeEventListener("mouseleave", disappear)
    }
  }
}