import type { Action } from "svelte/types/runtime/action/index"

export const dropdown: Action<HTMLElement> = (node, text) => {
  let lastAnim: Animation

  const divDropdown = window.document.createElement("div")
  divDropdown.classList.add("dropdown")
  divDropdown.classList.add("absolute")
  divDropdown.classList.add("pointer-events-none")

  divDropdown.innerHTML = `
    <div class="btn shadow-sm shadow-light_text_black_20 dark:shadow-dark_text_white_20 dark:bg-dark_light_grey dark:text-white text-light_text_black bg-light_white dropdown-toggle border-transparent duration-150 text-body2" type="button" data-toggle="dropdown" aria-expanded="false">
      ${text}
    </div>
  `
  divDropdown.style.opacity = "0"


  window.document.querySelector("body")?.appendChild(divDropdown)
  const rect = divDropdown.getBoundingClientRect()


  function onHover(e: MouseEvent) {
    divDropdown.style.top = `${e.clientY - rect.height - 10}px`
    divDropdown.style.left = `${e.clientX - rect.width / 2}px`
  }

  function appear() {
    lastAnim = divDropdown.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, fill: "forwards", delay: 500 })
  }

  function disappear() {
    divDropdown.animate([{ opacity: lastAnim.playState === "finished" ? 1 : divDropdown.style.opacity }, { opacity: 0 }], { duration: 150, fill: "forwards" })
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