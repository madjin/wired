import { useEffect } from "react";

import { useAppStore } from "./store";

export function useAppHotkeys() {
  useEffect(() => {
    async function handleKeyDown(e: KeyboardEvent) {
      const chatBoxFocused = useAppStore.getState().chatBoxFocused;
      if (chatBoxFocused) {
        e.stopImmediatePropagation();
        return;
      }

      switch (e.key) {
        case "Enter":
        case "T":
        case "t": {
          e.preventDefault();
          useAppStore.setState({ chatBoxFocused: true });
          break;
        }
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
}