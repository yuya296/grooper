import { parseConfigYaml } from '../core/config.js';
import { createPlan } from '../core/planner.js';
import type { CompiledConfig, StateSnapshot } from '../core/types.js';
import { executePlan, moveTabToGroup } from './executor.js';
import { getAdjacentGroup, orderGroupsByTabIndex } from '../core/shortcuts.js';
import { handleDiag } from './diagnostics.js';
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
const pendingNewTabIds = new Set<number>();

function isTransientNewTabUrl(url?: string) {
  if (!url) return true;
  return (
    url === 'about:blank' ||
    url.startsWith('chrome://newtab') ||
    url.startsWith('edge://newtab') ||
    url.startsWith('about:newtab')
  );
}

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
      index: tab.index,
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
  if (message?.__diag__) {
    if (!__DIAGNOSTICS__) {
      sendResponse({ ok: false, error: 'diagnostics disabled' });
      return true;
    }
    handleDiag(message.__diag__)
      .then((result) => sendResponse(result))
      .catch((err) => sendResponse({ ok: false, error: String(err) }));
    return true;
  }
  return false;
});

chrome.tabs.onCreated.addListener((tab) => {
  void (async () => {
    const { config } = await loadConfig();
    if (!config || !shouldApply(config, 'newTabs')) return;
    if (!tab.id) return;
    pendingNewTabIds.add(tab.id);
    if (!isTransientNewTabUrl(tab.url)) {
      await runWithScope({ windowId: tab.windowId, tabIds: [tab.id], reason: 'onCreated', includeCleanup: false });
      pendingNewTabIds.delete(tab.id);
    }
  })();
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!changeInfo.url) return;
  void (async () => {
    const { config } = await loadConfig();
    if (!config) return;
    if (shouldApply(config, 'always')) {
      await runWithScope({ windowId: tab.windowId, tabIds: [tabId], reason: 'onUpdated', includeCleanup: false });
      return;
    }
    if (shouldApply(config, 'newTabs') && pendingNewTabIds.has(tabId)) {
      if (isTransientNewTabUrl(changeInfo.url)) return;
      await runWithScope({ windowId: tab.windowId, tabIds: [tabId], reason: 'onUpdated:newTab', includeCleanup: false });
      pendingNewTabIds.delete(tabId);
    }
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
  pendingNewTabIds.delete(tabId);
  void removeLastActive(tabId);
});

async function getActiveTab() {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  return tabs[0];
}

async function getGroupOrder(windowId: number) {
  const tabs = await chrome.tabs.query({ windowId });
  const groups = await chrome.tabGroups.query({ windowId });
  return orderGroupsByTabIndex({
    tabs: tabs.map((tab) => ({
      id: tab.id!,
      windowId: tab.windowId,
      groupId: tab.groupId,
      index: tab.index
    })),
    groups: groups.map((group) => ({
      id: group.id,
      title: group.title ?? '',
      windowId: group.windowId
    }))
  });
}

chrome.commands.onCommand.addListener((command) => {
  void (async () => {
    const activeTab = await getActiveTab();
    if (!activeTab?.id) return;
    const windowId = activeTab.windowId;

    if (command === 'ungroup') {
      await chrome.tabs.ungroup(activeTab.id);
      return;
    }

    if (command === 'move-next-group' || command === 'move-prev-group') {
      const orderedGroups = await getGroupOrder(windowId);
      const target = getAdjacentGroup(orderedGroups, activeTab.groupId, command === 'move-next-group' ? 'next' : 'prev');
      if (!target) return;
      await chrome.tabs.group({ tabIds: [activeTab.id], groupId: target.id });
      return;
    }

    if (command.startsWith('move-to-group-')) {
      const { config } = await loadConfig();
      if (!config) return;
      const slotIndex = Number(command.replace('move-to-group-', '')) - 1;
      const groupName = config.shortcuts?.slots?.[slotIndex];
      if (!groupName) return;
      const color = config.groups[groupName]?.color;
      await moveTabToGroup(activeTab.id, windowId, groupName, color);
    }
  })();
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

// Expose diagnostics handler for tests
if (__DIAGNOSTICS__) {
  (globalThis as any).__handleDiag__ = handleDiag;
}
