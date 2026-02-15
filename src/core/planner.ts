import type { CompiledConfig, Plan, StateSnapshot, TabState } from './types.js';
import type { Clock } from './clock.js';
import { systemClock } from './clock.js';
import { buildCleanupActions } from './cleanup.js';
import { expandGroupCaptures } from './rule-template.js';

function matchRule(config: CompiledConfig, tab: TabState): { group: string; color?: string } | null {
  if (!tab.url) return null;
  for (const rule of config.rules) {
    const match = tab.url.match(rule.regex);
    if (match) {
      return { group: expandGroupCaptures(rule.group, match), color: rule.color };
    }
  }
  return null;
}

function resolveParentGroup(state: StateSnapshot, tab: TabState) {
  if (!tab.openerTabId) return null;
  const parent = state.tabs.find((candidate) => candidate.id === tab.openerTabId);
  if (!parent || parent.groupId == null) return null;
  const group = state.groups.find((g) => g.id === parent.groupId);
  if (!group) return null;
  return { group: group.title, color: group.color };
}

export function createPlan(
  state: StateSnapshot,
  config: CompiledConfig,
  options?: { scopeTabIds?: Set<number>; includeCleanup?: boolean; clock?: Clock }
): Plan {
  const actions: Plan['actions'] = [];
  const groupAssignments = new Map<number, { group: string; color?: string; windowId: number }>();
  const scope = options?.scopeTabIds;
  const targetTabs = scope ? state.tabs.filter((tab) => scope.has(tab.id)) : state.tabs;

  for (const tab of targetTabs) {
    let matched = null;
    if (config.groupingPriority === 'ruleFirst') {
      matched = matchRule(config, tab);
      if (!matched && config.parentFollow) {
        matched = resolveParentGroup(state, tab);
      }
    } else {
      if (config.parentFollow) {
        matched = resolveParentGroup(state, tab);
      }
      if (!matched) {
        matched = matchRule(config, tab);
      }
    }
    if (!matched && config.fallbackGroup) {
      matched = { group: config.fallbackGroup };
    }
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

  if (options?.includeCleanup ?? !scope) {
    const clock = options?.clock ?? systemClock;
    actions.push(...buildCleanupActions(state, config, clock));
  }

  return { actions };
}
