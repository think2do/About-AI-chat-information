// Theme mode (Spec 017): light | dark, toggled from the nav rail, persisted in localStorage.
// The pre-paint init logic is duplicated as an inline script in layout.tsx (a module can't be
// imported before hydration) — keep the two in sync. Design values live in globals.css [data-theme].

export type ThemeMode = "light" | "dark";
export const THEME_KEY = "teaching_tool_theme";

/** Read a valid stored choice, or null if none/unavailable. */
export function getStored(): ThemeMode | null {
  try {
    const v = localStorage.getItem(THEME_KEY);
    return v === "light" || v === "dark" ? v : null;
  } catch {
    return null;
  }
}

/** Stored choice wins; otherwise follow the OS preference; fall back to light. */
export function resolveInitial(): ThemeMode {
  const stored = getStored();
  if (stored) return stored;
  try {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  } catch {
    return "light";
  }
}

/** Apply a mode to <html> and persist the explicit choice. */
export function applyTheme(mode: ThemeMode): void {
  try {
    document.documentElement.dataset.theme = mode;
    localStorage.setItem(THEME_KEY, mode);
  } catch {
    /* ignore (private mode / SSR) */
  }
}
