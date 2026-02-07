import { THEME_MODE_KEY, applyTheme, normalizeThemeMode, type ThemeMode } from '../theme.js';
import { LANGUAGE_KEY, loadLocale, t, type Locale } from '../i18n.js';

const button = document.getElementById('run') as HTMLButtonElement;
const openOptionsButton = document.getElementById('openOptions') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLDivElement;
const title = document.getElementById('title') as HTMLParagraphElement;
let currentLocale: Locale = 'ja';

function applyPopupTheme(mode: ThemeMode) {
  applyTheme(mode, document, window.matchMedia('(prefers-color-scheme: dark)').matches);
}

async function loadAndApplyTheme() {
  const result = await chrome.storage.local.get(THEME_MODE_KEY);
  applyPopupTheme(normalizeThemeMode(result[THEME_MODE_KEY]));
}

void loadAndApplyTheme();

function applyPopupLocale(locale: Locale) {
  currentLocale = locale;
  document.documentElement.lang = locale;
  document.title = t(locale, 'popup.title');
  title.textContent = t(locale, 'popup.title');
  button.textContent = t(locale, 'popup.runNow');
  openOptionsButton.textContent = t(locale, 'popup.openSettings');
}

async function loadAndApplyLocale() {
  const locale = await loadLocale();
  applyPopupLocale(locale);
}

void loadAndApplyLocale();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local') return;
  if (changes[THEME_MODE_KEY]) {
    const next = changes[THEME_MODE_KEY].newValue as ThemeMode | undefined;
    applyPopupTheme(normalizeThemeMode(next));
  }
  if (changes[LANGUAGE_KEY]) {
    const next = changes[LANGUAGE_KEY].newValue;
    if (next === 'ja' || next === 'en') applyPopupLocale(next);
  }
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  void loadAndApplyTheme();
});

function setStatus(message: string) {
  status.textContent = message;
}

button.addEventListener('click', () => {
  setStatus(t(currentLocale, 'popup.running'));
  chrome.runtime.sendMessage({ type: 'run-manual' }, (response) => {
    if (chrome.runtime.lastError) {
      setStatus(t(currentLocale, 'popup.error', { message: chrome.runtime.lastError.message }));
      return;
    }
    if (!response?.ok) {
      const errors = response?.errors?.map((e: { path: string; message: string }) => `${e.path}: ${e.message}`).join(', ');
      setStatus(t(currentLocale, 'popup.failed', { errors: errors ?? t(currentLocale, 'popup.unknownError') }));
      return;
    }
    setStatus(t(currentLocale, 'popup.done'));
  });
});

openOptionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
