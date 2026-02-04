import type { Plan, PlanAction } from '../core/types.js';

export async function findGroupByTitle(windowId: number, title: string) {
  const groups = await chrome.tabGroups.query({ windowId });
  return groups.find((g) => g.title === title);
}

export async function ensureGroup(windowId: number, title: string, color?: string) {
  const group = await findGroupByTitle(windowId, title);
  if (!group) return undefined;
  if (group.title !== title || (color && group.color !== color)) {
    await chrome.tabGroups.update(group.id, { title, color: color as chrome.tabGroups.ColorEnum | undefined });
  }
  return group.id;
}

export async function moveTabToGroup(tabId: number, windowId: number, title: string, color?: string) {
  let group = await findGroupByTitle(windowId, title);
  if (!group) {
    const groupId = await chrome.tabs.group({ tabIds: [tabId], createProperties: { windowId } });
    await chrome.tabGroups.update(groupId, { title, color: color as chrome.tabGroups.ColorEnum | undefined });
    return;
  }
  await chrome.tabs.group({ tabIds: [tabId], groupId: group.id });
  if (color && group.color !== color) {
    await chrome.tabGroups.update(group.id, { color: color as chrome.tabGroups.ColorEnum });
  }
}

export async function executePlan(plan: Plan) {
  for (const action of plan.actions) {
    await executeAction(action);
  }
}

async function executeAction(action: PlanAction) {
  switch (action.type) {
    case 'ensureGroup':
      await ensureGroup(action.windowId, action.group, action.color);
      return;
    case 'moveTab':
      await moveTabToGroup(action.tabId, action.windowId, action.group, action.color);
      return;
    case 'closeTab':
      await chrome.tabs.remove(action.tabId);
      return;
    case 'log':
      console.log(`[tabgrouper] ${action.level}: ${action.message}`);
      return;
    default:
      return;
  }
}
