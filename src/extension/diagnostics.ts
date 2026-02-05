import { parseConfigYaml } from '../core/config.js';
import { createPlan } from '../core/planner.js';
import type { Plan, StateSnapshot } from '../core/types.js';
import { executePlan } from './executor.js';
import { appendLog, DEFAULT_CONFIG_YAML, getConfigYaml, getLogs, getLastActiveMap, setConfigYaml } from './storage.js';

export interface DiagRequest {
  command: 'getState' | 'runOnce' | 'setConfig' | 'getConfig' | 'reset' | 'getLogs';
  payload?: unknown;
}

export interface DiagResponse {
  ok: boolean;
  error?: string;
  plan?: Plan;
  state?: StateSnapshot;
  config?: string;
  logs?: string[];
}

async function buildSnapshot(): Promise<StateSnapshot> {
  const [tabs, groups, lastActive] = await Promise.all([
    chrome.tabs.query({}),
    chrome.tabGroups.query({}),
    getLastActiveMap()
  ]);
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

function filterSnapshot(snapshot: StateSnapshot, windowId?: number): StateSnapshot {
  if (windowId == null) return snapshot;
  return {
    tabs: snapshot.tabs.filter((tab) => tab.windowId === windowId),
    groups: snapshot.groups.filter((group) => group.windowId === windowId)
  };
}

export async function handleDiag(request: DiagRequest): Promise<DiagResponse> {
  switch (request.command) {
    case 'getState': {
      const state = await buildSnapshot();
      return { ok: true, state };
    }
    case 'runOnce': {
      const payload = (request.payload as { scope?: { windowId?: number; tabIds?: number[] }; dryRun?: boolean }) ?? {};
      const yaml = await getConfigYaml();
      const { config, errors } = parseConfigYaml(yaml);
      if (!config) {
        return { ok: false, error: errors.map((e) => `${e.path}: ${e.message}`).join(', ') };
      }
      const snapshot = filterSnapshot(await buildSnapshot(), payload.scope?.windowId);
      const scopeTabIds = payload.scope?.tabIds ? new Set(payload.scope.tabIds) : undefined;
      const plan = createPlan(snapshot, config, { scopeTabIds, includeCleanup: true });
      if (!payload.dryRun) {
        await executePlan(plan);
      }
      await appendLog(`diag runOnce: ${plan.actions.length} actions`);
      return { ok: true, plan };
    }
    case 'setConfig': {
      const yaml = String((request.payload as { yaml?: string })?.yaml ?? '');
      const { config, errors } = parseConfigYaml(yaml);
      if (!config) {
        return { ok: false, error: errors.map((e) => `${e.path}: ${e.message}`).join(', ') };
      }
      await setConfigYaml(yaml);
      return { ok: true };
    }
    case 'getConfig': {
      const yaml = await getConfigYaml();
      return { ok: true, config: yaml };
    }
    case 'reset': {
      await chrome.storage.local.clear();
      await setConfigYaml(DEFAULT_CONFIG_YAML);
      return { ok: true };
    }
    case 'getLogs': {
      const logs = await getLogs();
      return { ok: true, logs };
    }
    default:
      return { ok: false, error: 'unknown command' };
  }
}
