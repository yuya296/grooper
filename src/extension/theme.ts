export type ThemeMode = 'system' | 'light' | 'dark';

export const THEME_MODE_KEY = 'themeMode';
export const DEFAULT_THEME_MODE: ThemeMode = 'system';

export function normalizeThemeMode(input: unknown): ThemeMode {
  if (input === 'light' || input === 'dark' || input === 'system') return input;
  return DEFAULT_THEME_MODE;
}

export async function loadThemeMode(): Promise<ThemeMode> {
  const result = await chrome.storage.local.get(THEME_MODE_KEY);
  return normalizeThemeMode(result[THEME_MODE_KEY]);
}

export function resolveEffectiveTheme(mode: ThemeMode, prefersDark: boolean): 'light' | 'dark' {
  if (mode === 'system') return prefersDark ? 'dark' : 'light';
  return mode;
}

export function applyTheme(mode: ThemeMode, documentRef: Document, prefersDark: boolean) {
  const effective = resolveEffectiveTheme(mode, prefersDark);
  documentRef.documentElement.dataset.themeMode = mode;
  documentRef.documentElement.dataset.theme = effective;
}
