import { parseConfigYaml } from '../../core/config.js';
import { createPlan } from '../../core/planner.js';
import type { StateSnapshot } from '../../core/types.js';
import { buildYamlFromUi, parseYamlForUi, type RuleForm, type UiState } from './uiState.js';

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

const applyModeSelect = document.getElementById('applyMode') as HTMLSelectElement;
const fallbackModeSelect = document.getElementById('fallbackMode') as HTMLSelectElement;
const fallbackGroupInput = document.getElementById('fallbackGroup') as HTMLInputElement;
const rulesList = document.getElementById('rulesList') as HTMLDivElement;
const addRuleButton = document.getElementById('addRule') as HTMLButtonElement;

const tabButtons = Array.from(document.querySelectorAll('.tab-button')) as HTMLButtonElement[];
const tabSource = document.getElementById('tab-source') as HTMLDivElement;
const tabUi = document.getElementById('tab-ui') as HTMLDivElement;

const HISTORY_KEY = 'configHistory';

interface HistoryEntry {
  timestamp: string;
  yaml: string;
}

let activeTab: 'source' | 'ui' = 'source';
let uiState: UiState = { applyMode: 'manual', fallbackGroup: undefined, rules: [] };
let rawConfig: Record<string, unknown> | null = null;

function renderErrors(messages: string[]) {
  errors.textContent = messages.length === 0 ? '' : messages.join('\n');
}

function setActiveTab(tab: 'source' | 'ui') {
  if (tab === 'ui') {
    const ok = syncUiFromYaml();
    if (!ok) return;
  } else {
    syncYamlFromUi();
  }
  activeTab = tab;
  tabButtons.forEach((button) => {
    button.classList.toggle('active', button.dataset.tab === tab);
  });
  tabSource.classList.toggle('active', tab === 'source');
  tabUi.classList.toggle('active', tab === 'ui');
}

function syncUiFromYaml(): boolean {
  const result = parseYamlForUi(yamlArea.value);
  if (!result.ok) {
    renderErrors(result.errors);
    return false;
  }
  rawConfig = result.rawConfig;
  uiState = result.uiState;
  renderUi();
  renderErrors([]);
  return true;
}

function syncYamlFromUi() {
  const result = buildYamlFromUi(rawConfig, uiState);
  rawConfig = result.rawConfig;
  yamlArea.value = result.yaml;
}

function updateRule(index: number, patch: Partial<RuleForm>) {
  const next = { ...uiState.rules[index], ...patch };
  uiState.rules[index] = next;
  syncYamlFromUi();
}

function moveRule(from: number, to: number) {
  if (!Number.isFinite(from) || !Number.isFinite(to)) return;
  if (from === to || from < 0 || to < 0) return;
  const [entry] = uiState.rules.splice(from, 1);
  uiState.rules.splice(to, 0, entry);
  renderRules();
  syncYamlFromUi();
}

function renderRules() {
  rulesList.innerHTML = '';
  uiState.rules.forEach((rule, index) => {
    const item = document.createElement('div');
    item.className = 'rule-item';
    item.dataset.index = String(index);

    const handle = document.createElement('div');
    handle.className = 'drag-handle';
    handle.textContent = '≡';
    handle.draggable = true;

    const patternInput = document.createElement('input');
    patternInput.placeholder = 'pattern (regex)';
    patternInput.value = rule.pattern;
    patternInput.addEventListener('input', () => updateRule(index, { pattern: patternInput.value }));

    const groupInput = document.createElement('input');
    groupInput.placeholder = 'group';
    groupInput.value = rule.group;
    groupInput.addEventListener('input', () => updateRule(index, { group: groupInput.value }));

    const colorInput = document.createElement('input');
    colorInput.placeholder = 'color';
    colorInput.value = rule.color ?? '';
    colorInput.addEventListener('input', () => updateRule(index, { color: colorInput.value || undefined }));

    const priorityInput = document.createElement('input');
    priorityInput.type = 'number';
    priorityInput.placeholder = 'priority';
    priorityInput.value = rule.priority != null ? String(rule.priority) : '';
    priorityInput.addEventListener('input', () => {
      const value = priorityInput.value;
      updateRule(index, { priority: value === '' ? undefined : Number(value) });
    });

    const removeButton = document.createElement('button');
    removeButton.className = 'remove';
    removeButton.textContent = '削除';
    removeButton.addEventListener('click', () => {
      uiState.rules.splice(index, 1);
      renderRules();
      syncYamlFromUi();
    });

    handle.addEventListener('dragstart', (event) => {
      event.dataTransfer?.setData('text/plain', String(index));
      event.dataTransfer?.setDragImage(item, 10, 10);
      event.dataTransfer?.setData('text/index', String(index));
    });

    item.addEventListener('dragover', (event) => {
      event.preventDefault();
      item.classList.add('drag-over');
      if (event.dataTransfer) event.dataTransfer.dropEffect = 'move';
    });

    item.addEventListener('dragleave', () => {
      item.classList.remove('drag-over');
    });

    item.addEventListener('drop', (event) => {
      event.preventDefault();
      item.classList.remove('drag-over');
      const from = Number(event.dataTransfer?.getData('text/plain'));
      moveRule(from, index);
    });

    item.append(handle, patternInput, groupInput, colorInput, priorityInput, removeButton);
    rulesList.appendChild(item);
  });
}

function renderUi() {
  applyModeSelect.value = uiState.applyMode;
  const hasFallback = !!uiState.fallbackGroup;
  fallbackModeSelect.value = hasFallback ? 'custom' : 'none';
  fallbackGroupInput.value = uiState.fallbackGroup ?? '';
  fallbackGroupInput.disabled = !hasFallback;
  renderRules();
}

function ensureYamlUpToDate() {
  if (activeTab === 'ui') {
    syncYamlFromUi();
  }
}

function validateYaml() {
  ensureYamlUpToDate();
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
  ensureYamlUpToDate();
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
  if (activeTab === 'ui') syncUiFromYaml();
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
  if (activeTab === 'ui') syncUiFromYaml();
}

applyModeSelect.addEventListener('change', () => {
  uiState.applyMode = applyModeSelect.value as UiState['applyMode'];
  syncYamlFromUi();
});

fallbackModeSelect.addEventListener('change', () => {
  const mode = fallbackModeSelect.value;
  if (mode === 'none') {
    uiState.fallbackGroup = undefined;
    fallbackGroupInput.value = '';
    fallbackGroupInput.disabled = true;
  } else {
    fallbackGroupInput.disabled = false;
    uiState.fallbackGroup = fallbackGroupInput.value.trim();
  }
  syncYamlFromUi();
});

fallbackGroupInput.addEventListener('input', () => {
  if (fallbackModeSelect.value !== 'custom') return;
  const value = fallbackGroupInput.value.trim();
  uiState.fallbackGroup = value.length > 0 ? value : undefined;
  syncYamlFromUi();
});

addRuleButton.addEventListener('click', () => {
  uiState.rules.push({ pattern: '', group: '', color: undefined, priority: undefined });
  renderRules();
  syncYamlFromUi();
});

tabButtons.forEach((button) => {
  button.addEventListener('click', () => {
    const tab = button.dataset.tab as 'source' | 'ui';
    setActiveTab(tab);
  });
});

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
