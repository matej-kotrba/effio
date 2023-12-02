import type { Action } from "svelte/action";

export const handwrite: Action<HTMLElement, { duration?: number } | undefined> = (element, options = { duration: 2000 }) => {
  const { duration = 2000 } = options

  const text = element.innerText
  element.innerText = ""

  text.split("").forEach((char, index) => {
    const span = document.createElement("span")
    span.innerHTML = char
    span.style.opacity = "0"
    span.style.borderRight = "4px solid black"
    span.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: (duration / text.length) * index, fill: "forwards" })

    element.appendChild(span)
  })
  return
}