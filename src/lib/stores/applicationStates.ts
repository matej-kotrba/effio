import { writable } from "svelte/store";

type ApplicationStates = {
  isDarkMode: boolean;
}

export const applicationStates = writable<ApplicationStates>({
  isDarkMode: true
})