import { parseConfigYaml } from '../../core/config.js';
import { createPlan } from '../../core/planner.js';
import type { StateSnapshot } from '../../core/types.js';

const yamlArea = document.getElementById('yaml') as HTMLTextAreaElement;
const errors = document.getElementById('errors') as HTMLDivElement;
const previewOutput = document.getElementById('previewOutput') as HTMLDivElement;
const history = document.getElementById('history') as HTMLDivElement;

const validateButton = document.getElementById('validate') as HTMLButtonElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const exportButton = document.getElementById('export') as HTMLButtonElement;
const importButton = document.getElementById('import') as HTMLButtonElement;
const previewButton = document.getElementById('preview') as HTMLButtonElement;
const rollbackButton = document.getElementById('rollback') as HTMLButtonElement;

const HISTORY_KEY = 'configHistory';

interface HistoryEntry {
  timestamp: string;
  yaml: string;
}

function renderErrors(messages: string[]) {
  errors.textContent = messages.length === 0 ? '' : messages.join('\n');
}

function validateYaml() {
  const result = parseConfigYaml(yamlArea.value);
  if (result.errors.length > 0) {
    renderErrors(result.errors.map((e) => `${e.path}: ${e.message}`));
    return { ok: false, errors: result.errors } as const;
  }
  renderErrors(['OK']);
  return { ok: true, config: result.config! } as const;
}

async function loadYaml() {
  const result = await chrome.storage.local.get('configYaml');
  yamlArea.value = (result.configYaml as string) ?? '';
}

async function getHistory(): Promise<HistoryEntry[]> {
  const result = await chrome.storage.local.get(HISTORY_KEY);
  return (result[HISTORY_KEY] as HistoryEntry[]) ?? [];
}

async function saveHistory(previousYaml: string) {
  const history = await getHistory();
  const entry: HistoryEntry = { timestamp: new Date().toISOString(), yaml: previousYaml };
  const next = [entry, ...history].slice(0, 20);
  await chrome.storage.local.set({ [HISTORY_KEY]: next });
}

function renderHistory(entries: HistoryEntry[]) {
  if (entries.length === 0) {
    history.textContent = '履歴はまだありません。';
    return;
  }
  history.innerHTML = entries
    .map((entry) => `<div class="history-item">${entry.timestamp}</div>`)
    .join('');
}

async function saveYaml() {
  const result = validateYaml();
  if (!result.ok) return;
  const current = await chrome.storage.local.get('configYaml');
  const existing = (current.configYaml as string) ?? '';
  if (existing && existing !== yamlArea.value) {
    await saveHistory(existing);
  }
  await chrome.storage.local.set({ configYaml: yamlArea.value });
  renderErrors(['保存しました']);
  renderHistory(await getHistory());
}

async function exportYaml() {
  try {
    await navigator.clipboard.writeText(yamlArea.value);
    renderErrors(['クリップボードにコピーしました']);
  } catch {
    const exported = prompt('YAMLをコピーしてください', yamlArea.value);
    if (exported != null) {
      renderErrors(['エクスポートしました']);
    }
  }
}

async function importYaml() {
  const imported = prompt('YAMLを貼り付けてください');
  if (imported == null) return;
  yamlArea.value = imported;
  validateYaml();
}

async function buildStateSnapshot(): Promise<StateSnapshot> {
  const [tabs, groups, lastActive] = await Promise.all([
    chrome.tabs.query({}),
    chrome.tabGroups.query({}),
    chrome.storage.local.get('lastActiveAt')
  ]);
  const lastActiveMap = (lastActive.lastActiveAt as Record<string, number>) ?? {};
  return {
    tabs: tabs.map((tab) => ({
      id: tab.id!,
      url: tab.url,
      groupId: tab.groupId,
      windowId: tab.windowId,
      openerTabId: tab.openerTabId,
      active: tab.active,
      pinned: tab.pinned,
      index: tab.index,
      lastAccessed: tab.lastAccessed,
      lastActiveAt: lastActiveMap[String(tab.id!)]
    })),
    groups: groups.map((group) => ({
      id: group.id,
      title: group.title ?? '',
      color: group.color,
      windowId: group.windowId
    }))
  };
}

async function previewPlan() {
  const result = validateYaml();
  if (!result.ok) return;
  const state = await buildStateSnapshot();
  const plan = createPlan(state, result.config, { includeCleanup: true });
  if (plan.actions.length === 0) {
    previewOutput.textContent = '変更はありません。';
    return;
  }
  previewOutput.textContent = plan.actions
    .map((action) => {
      if (action.type === 'moveTab') return `move tab ${action.tabId} -> ${action.group}`;
      if (action.type === 'ensureGroup') return `ensure group ${action.group}`;
      if (action.type === 'closeTab') return `close tab ${action.tabId} (${action.reason})`;
      return `${action.type}`;
    })
    .join('\n');
}

async function rollback() {
  const entries = await getHistory();
  if (entries.length === 0) {
    renderErrors(['履歴がありません']);
    return;
  }
  const latest = entries[0];
  yamlArea.value = latest.yaml;
  await chrome.storage.local.set({ configYaml: latest.yaml });
  renderErrors(['直前の履歴へロールバックしました']);
  renderHistory(entries.slice(1));
}

validateButton.addEventListener('click', () => {
  validateYaml();
});

saveButton.addEventListener('click', () => {
  void saveYaml();
});

exportButton.addEventListener('click', () => {
  void exportYaml();
});

importButton.addEventListener('click', () => {
  void importYaml();
});

previewButton.addEventListener('click', () => {
  void previewPlan();
});

rollbackButton.addEventListener('click', () => {
  void rollback();
});

void (async () => {
  await loadYaml();
  renderHistory(await getHistory());
})();
