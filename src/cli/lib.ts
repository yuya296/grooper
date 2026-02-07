import { parseConfigYaml } from '../core/config.js';
import type { Plan, StateSnapshot } from '../core/types.js';

export function ensureConfig(yaml: string) {
  const { config, errors } = parseConfigYaml(yaml);
  if (!config) {
    const message = errors.map((e) => `${e.path}: ${e.message}`).join('\n');
    throw new Error(message);
  }
  return config;
}

export function applyPlan(state: StateSnapshot, plan: Plan): StateSnapshot {
  const next: StateSnapshot = {
    tabs: state.tabs.map((tab) => ({ ...tab })),
    groups: state.groups.map((group) => ({ ...group }))
  };

  const nextGroupId = () => {
    const currentMax = next.groups.reduce((max, group) => Math.max(max, group.id), 0);
    return currentMax + 1;
  };

  const findGroup = (windowId: number, title: string) =>
    next.groups.find((group) => group.windowId === windowId && group.title === title);

  for (const action of plan.actions) {
    if (action.type === 'ensureGroup') {
      let group = findGroup(action.windowId, action.group);
      if (!group) {
        group = { id: nextGroupId(), title: action.group, color: action.color, windowId: action.windowId };
        next.groups.push(group);
      } else if (action.color) {
        group.color = action.color;
      }
    }

    if (action.type === 'moveTab') {
      let group = findGroup(action.windowId, action.group);
      if (!group) {
        group = { id: nextGroupId(), title: action.group, color: undefined, windowId: action.windowId };
        next.groups.push(group);
      }
      const tab = next.tabs.find((t) => t.id === action.tabId);
      if (tab) tab.groupId = group.id;
    }

    if (action.type === 'closeTab') {
      next.tabs = next.tabs.filter((tab) => tab.id !== action.tabId);
    }
  }

  return next;
}
