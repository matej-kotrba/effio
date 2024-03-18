import type { Action } from "svelte/action";

export const handwrite: Action<HTMLElement, { duration?: number, delay?: number; enabled?: boolean } | undefined> = (element, options = { duration: 2000, delay: 0, enabled: true }) => {
  const { duration = 2000 } = options

  const text = element.innerText

  if (options.enabled) {
    element.innerText = ""
    text.split("").forEach((char, index) => {
      const span = document.createElement("span")
      span.innerHTML = char
      span.style.opacity = "0"
      span.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: (options?.delay || 0) + (duration / text.length) * index, fill: "forwards" })

      element.appendChild(span)
    })
  }
  else {
    element.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: "forwards" })
  }
  return {
    update(data) {
      const text = element.innerText
      if (data!.enabled) {
        element.innerText = ""
        text.split("").forEach((char, index) => {
          const span = document.createElement("span")
          span.innerHTML = char
          span.style.opacity = "0"
          span.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 1, delay: (options?.delay || 0) + (duration / text.length) * index, fill: "forwards" })

          element.appendChild(span)
        })
      }
      else {
        element.animate([{ opacity: 0 }, { opacity: 1 }], { duration, fill: "forwards" })
      }
    }
  }
}