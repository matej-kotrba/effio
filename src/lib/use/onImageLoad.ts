import type { Action } from "svelte/action";

export const onImageLoad: Action<HTMLImageElement, any> = (imageEl) => {
  imageEl.addEventListener("error", (e) => imageEl.dispatchEvent(new CustomEvent('imageerror', { detail: e })));

  return {
    destroy() {
      imageEl.removeEventListener("error", (e) => imageEl.dispatchEvent(new CustomEvent('imageerror', { detail: e })));
    },
  };
}