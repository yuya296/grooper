import type { Plan, PlanAction } from '../core/types.js';
import { buildGroupedFirstUnpinnedOrder } from '../core/tab-order.js';

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
  const reorderWindowIds = new Set<number>();
  for (const action of plan.actions) {
    if (action.type === 'moveTab') {
      reorderWindowIds.add(action.windowId);
    }
    await executeAction(action);
  }
  for (const windowId of reorderWindowIds) {
    await reorderGroupedTabsFirst(windowId);
  }
}

export async function reorderGroupedTabsFirst(windowId: number) {
  const tabs = await chrome.tabs.query({ windowId });
  const orderedByIndex = [...tabs].sort((a, b) => a.index - b.index);
  const currentUnpinnedIds = orderedByIndex.filter((tab) => !tab.pinned).map((tab) => tab.id!);
  const { startIndex, tabIds } = buildGroupedFirstUnpinnedOrder(
    orderedByIndex.map((tab) => ({
      id: tab.id!,
      index: tab.index,
      groupId: tab.groupId,
      pinned: tab.pinned
    }))
  );
  if (currentUnpinnedIds.length !== tabIds.length) return;
  const changed = currentUnpinnedIds.some((id, index) => id !== tabIds[index]);
  if (!changed) return;
  for (let offset = 0; offset < tabIds.length; offset += 1) {
    await chrome.tabs.move(tabIds[offset], { index: startIndex + offset });
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
