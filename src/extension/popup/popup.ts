import { THEME_MODE_KEY, applyTheme, normalizeThemeMode, type ThemeMode } from '../theme.js';

const button = document.getElementById('run') as HTMLButtonElement;
const openOptionsButton = document.getElementById('openOptions') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLDivElement;

function applyPopupTheme(mode: ThemeMode) {
  applyTheme(mode, document, window.matchMedia('(prefers-color-scheme: dark)').matches);
}

async function loadAndApplyTheme() {
  const result = await chrome.storage.local.get(THEME_MODE_KEY);
  applyPopupTheme(normalizeThemeMode(result[THEME_MODE_KEY]));
}

void loadAndApplyTheme();

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== 'local' || !changes[THEME_MODE_KEY]) return;
  const next = changes[THEME_MODE_KEY].newValue as ThemeMode | undefined;
  applyPopupTheme(normalizeThemeMode(next));
});

window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
  void loadAndApplyTheme();
});

function setStatus(message: string) {
  status.textContent = message;
}

button.addEventListener('click', () => {
  setStatus('実行中...');
  chrome.runtime.sendMessage({ type: 'run-manual' }, (response) => {
    if (chrome.runtime.lastError) {
      setStatus(`エラー: ${chrome.runtime.lastError.message}`);
      return;
    }
    if (!response?.ok) {
      const errors = response?.errors?.map((e: { path: string; message: string }) => `${e.path}: ${e.message}`).join(', ');
      setStatus(`失敗: ${errors ?? 'unknown error'}`);
      return;
    }
    setStatus('完了');
  });
});

openOptionsButton.addEventListener('click', () => {
  chrome.runtime.openOptionsPage();
});
