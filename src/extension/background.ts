import { parseConfigYaml } from '../core/config.js';
import { createPlan } from '../core/planner.js';
import type { StateSnapshot } from '../core/types.js';
import { executePlan } from './executor.js';
import { appendLog, DEFAULT_CONFIG_YAML, getConfigYaml, setConfigYaml } from './storage.js';

async function ensureDefaultConfig() {
  const existing = await chrome.storage.local.get('configYaml');
  if (!existing.configYaml) {
    await setConfigYaml(DEFAULT_CONFIG_YAML);
  }
}

async function getCurrentWindowState(): Promise<StateSnapshot> {
  const window = await chrome.windows.getLastFocused({ populate: false });
  const windowId = window.id ?? chrome.windows.WINDOW_ID_CURRENT;
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
      pinned: tab.pinned
    })),
    groups: groups.map((group) => ({
      id: group.id,
      title: group.title ?? '',
      color: group.color,
      windowId: group.windowId
    }))
  };
}

async function runManual() {
  const yaml = await getConfigYaml();
  const { config, errors } = parseConfigYaml(yaml);
  if (!config) {
    const message = `config error: ${errors.map((e) => `${e.path}: ${e.message}`).join(', ')}`;
    await appendLog(message);
    return { ok: false, errors };
  }
  const state = await getCurrentWindowState();
  const plan = createPlan(state, config);
  await executePlan(plan);
  await appendLog(`manual run: ${plan.actions.length} actions`);
  return { ok: true, plan };
}

chrome.runtime.onInstalled.addListener(() => {
  void ensureDefaultConfig();
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
