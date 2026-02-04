import type { CompiledConfig, Plan, StateSnapshot, TabState } from './types.js';

function matchRule(config: CompiledConfig, tab: TabState): { group: string; color?: string } | null {
  if (!tab.url) return null;
  for (const rule of config.rules) {
    if (rule.regex.test(tab.url)) {
      return { group: rule.group, color: rule.color };
    }
  }
  return null;
}

export function createPlan(state: StateSnapshot, config: CompiledConfig): Plan {
  const actions: Plan['actions'] = [];
  const groupAssignments = new Map<number, { group: string; color?: string; windowId: number }>();

  for (const tab of state.tabs) {
    const matched = matchRule(config, tab);
    if (!matched) continue;
    groupAssignments.set(tab.id, { ...matched, windowId: tab.windowId });
  }

  const ensureKey = new Set<string>();
  for (const assignment of groupAssignments.values()) {
    const key = `${assignment.windowId}:${assignment.group}`;
    if (!ensureKey.has(key)) {
      ensureKey.add(key);
      actions.push({
        type: 'ensureGroup',
        group: assignment.group,
        color: assignment.color,
        windowId: assignment.windowId
      });
    }
  }

  const groupById = new Map<number, string>();
  for (const group of state.groups) {
    groupById.set(group.id, group.title);
  }

  for (const [tabId, assignment] of groupAssignments.entries()) {
    const tab = state.tabs.find((t) => t.id === tabId);
    if (!tab) continue;
    const currentGroupTitle = tab.groupId ? groupById.get(tab.groupId) : undefined;
    if (currentGroupTitle === assignment.group) continue;
    actions.push({
      type: 'moveTab',
      tabId,
      group: assignment.group,
      windowId: assignment.windowId
    });
  }

  return { actions };
}
