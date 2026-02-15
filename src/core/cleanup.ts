import type { CompiledConfig, PlanAction, StateSnapshot, TabState } from './types.js';
import type { Clock } from './clock.js';

function lastUsed(tab: TabState) {
  return tab.lastActiveAt ?? tab.lastAccessed ?? 0;
}

function isClosable(tab: TabState) {
  return !tab.active && !tab.pinned;
}

export function buildCleanupActions(
  state: StateSnapshot,
  config: CompiledConfig,
  clock: Clock
): PlanAction[] {
  const actions: PlanAction[] = [];
  const now = clock.now();
  const closeSet = new Set<number>();

  for (const group of state.groups) {
    const policy = config.groupsByName[group.title]?.cleanup;
    if (!policy) continue;
    const tabs = state.tabs.filter((tab) => tab.groupId === group.id);

    if (policy.ttlMinutes != null) {
      const threshold = now - policy.ttlMinutes * 60 * 1000;
      for (const tab of tabs) {
        if (!isClosable(tab)) continue;
        if (lastUsed(tab) <= threshold) {
          closeSet.add(tab.id);
          actions.push({ type: 'closeTab', tabId: tab.id, reason: 'ttl' });
        }
      }
    }

    if (policy.maxTabs != null && tabs.length > policy.maxTabs) {
      const candidates = tabs
        .filter((tab) => isClosable(tab) && !closeSet.has(tab.id))
        .sort((a, b) => lastUsed(a) - lastUsed(b));
      const overflow = tabs.length - policy.maxTabs;
      for (const tab of candidates.slice(0, overflow)) {
        closeSet.add(tab.id);
        actions.push({ type: 'closeTab', tabId: tab.id, reason: 'maxTabs' });
      }
    }
  }

  return actions;
}
