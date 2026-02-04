import { parseConfigYaml } from '../core/config.js';
import { createPlan } from '../core/planner.js';
import type { CompiledConfig, StateSnapshot } from '../core/types.js';
import { executePlan } from './executor.js';
import {
  appendLog,
  DEFAULT_CONFIG_YAML,
  getConfigYaml,
  getLastActiveMap,
  removeLastActive,
  setConfigYaml,
  setLastActiveAt
} from './storage.js';

let isApplying = false;
const RESCAN_ALARM = 'tabgrouper-rescan';
const RESCAN_MINUTES = 5;

async function ensureDefaultConfig() {
  const existing = await chrome.storage.local.get('configYaml');
  if (!existing.configYaml) {
    await setConfigYaml(DEFAULT_CONFIG_YAML);
  }
}

async function getWindowState(windowId: number): Promise<StateSnapshot> {
  const lastActive = await getLastActiveMap();
  const tabs = await chrome.tabs.query({ windowId });
  const groups = await chrome.tabGroups.query({ windowId });
  return {
    tabs: tabs.map((tab) => ({
      id: tab.id!,
      url: tab.url,
      groupId: tab.groupId,
      windowId: tab.windowId,
      openerTabId: tab.openerTabId,
      active: tab.active,
      pinned: tab.pinned,
      lastAccessed: tab.lastAccessed,
      lastActiveAt: lastActive[String(tab.id!)]
    })),
    groups: groups.map((group) => ({
      id: group.id,
      title: group.title ?? '',
      color: group.color,
      windowId: group.windowId
    }))
  };
}

async function loadConfig(): Promise<{ config?: CompiledConfig; errors?: unknown }> {
  const yaml = await getConfigYaml();
  const { config, errors } = parseConfigYaml(yaml);
  if (!config) {
    const message = `config error: ${errors.map((e) => `${e.path}: ${e.message}`).join(', ')}`;
    await appendLog(message);
    return { errors };
  }
  return { config };
}

async function runWithScope(options: {
  windowId: number;
  tabIds?: number[];
  reason: string;
  includeCleanup?: boolean;
}) {
  if (isApplying) return;
  const { config, errors } = await loadConfig();
  if (!config || errors) return;
  isApplying = true;
  try {
    const state = await getWindowState(options.windowId);
    const scope = options.tabIds ? new Set(options.tabIds) : undefined;
    const plan = createPlan(state, config, { scopeTabIds: scope, includeCleanup: options.includeCleanup });
    await executePlan(plan);
    await appendLog(`${options.reason}: ${plan.actions.length} actions`);
  } finally {
    isApplying = false;
  }
}

async function runManual() {
  const window = await chrome.windows.getLastFocused({ populate: false });
  const windowId = window.id ?? chrome.windows.WINDOW_ID_CURRENT;
  await runWithScope({ windowId, reason: 'manual run', includeCleanup: true });
  return { ok: true };
}

function shouldApply(config: CompiledConfig, mode: 'newTabs' | 'always') {
  return config.applyMode === mode || config.applyMode === 'always';
}

async function ensureAlarm() {
  await chrome.alarms.create(RESCAN_ALARM, { periodInMinutes: RESCAN_MINUTES });
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaultConfig();
  void ensureAlarm();
});

chrome.runtime.onStartup?.addListener(() => {
  void ensureAlarm();
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message?.type === 'run-manual') {
    runManual()
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, errors: [{ path: 'runtime', message: String(err) }] }));
    return true;
  }
  return false;
});

chrome.tabs.onCreated.addListener((tab) => {
  void (async () => {
    const { config } = await loadConfig();
    if (!config || !shouldApply(config, 'newTabs')) return;
    if (!tab.id) return;
    await runWithScope({ windowId: tab.windowId, tabIds: [tab.id], reason: 'onCreated', includeCleanup: false });
  })();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  void (async () => {
    const { config } = await loadConfig();
    if (!config || !shouldApply(config, 'always')) return;
    await runWithScope({ windowId: tab.windowId, tabIds: [tabId], reason: 'onUpdated', includeCleanup: false });
  })();
});

chrome.tabs.onActivated.addListener((info) => {
  void (async () => {
    await setLastActiveAt(info.tabId, Date.now());
    const { config } = await loadConfig();
    if (!config || !shouldApply(config, 'always')) return;
    await runWithScope({ windowId: info.windowId, tabIds: [info.tabId], reason: 'onActivated', includeCleanup: false });
  })();
});

chrome.tabs.onRemoved.addListener((tabId) => {
  void removeLastActive(tabId);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== RESCAN_ALARM) return;
  void (async () => {
    const { config } = await loadConfig();
    if (!config || config.applyMode !== 'always') return;
    const windows = await chrome.windows.getAll();
    for (const window of windows) {
      if (window.id == null) continue;
      await runWithScope({ windowId: window.id, reason: 'rescan', includeCleanup: true });
    }
  })();
});
