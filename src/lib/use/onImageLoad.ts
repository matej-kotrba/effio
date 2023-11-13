import type { Action } from "svelte/action";

export const onImageLoad: Action<HTMLImageElement> = (imageEl) => {
  imageEl.addEventListener("error", (e) => imageEl.dispatchEvent(new CustomEvent('imageerror', { detail: e })));

  return {
    destroy() {
      imageEl.removeEventListener("error", (e) => imageEl.dispatchEvent(new CustomEvent('imageerror', { detail: e })));
    },
  };
}