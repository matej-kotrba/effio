import { browser } from "$app/environment";
import { writable } from "svelte/store";

type ApplicationStates = {
  darkMode: {
    isDarkMode: boolean;
    setIsDarkMode: (isDarkMode?: boolean) => void;
  }
}

export const applicationStates = writable<ApplicationStates>({
  darkMode: {
    isDarkMode: false,
    setIsDarkMode: (isDarkMode?: boolean) => {
      let darkModeState;
      applicationStates.update((states) => {
        darkModeState = isDarkMode || !states.darkMode.isDarkMode;
        return {
          ...states,
          darkMode: {
            ...states.darkMode,
            isDarkMode: darkModeState
          }
        };
      })
      if (browser) {
        localStorage.setItem("dark", darkModeState ? "true" : "false")
      }
    }
  }
})