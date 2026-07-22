export type ThemeMode = 'light' | 'dark'

export const THEME_KEY = 'teaching_tool_theme'

export function applyTheme(mode: ThemeMode): void {
  try {
    document.documentElement.dataset.theme = mode
    localStorage.setItem(THEME_KEY, mode)
  } catch {
    // Private browsing can make localStorage unavailable.
  }
}
