import type { Plan, PlanAction } from '../core/types.js';
import { buildGroupedFirstUnpinnedOrder } from '../core/tab-order.js';
import { isTabGroupColor } from '../core/tab-group-colors.js';

function toGroupColor(color?: string): chrome.tabGroups.ColorEnum | undefined {
  if (!isTabGroupColor(color)) return undefined;
  return color as chrome.tabGroups.ColorEnum;
}

async function updateGroupSafely(
  groupId: number,
  props: { title?: string; color?: chrome.tabGroups.ColorEnum }
) {
  try {
    await chrome.tabGroups.update(groupId, props);
  } catch (err) {
    if (props.color) {
      await chrome.tabGroups.update(groupId, { title: props.title });
      console.warn(`[tabgrouper] tabGroups.update color fallback: ${String(err)}`);
      return;
    }
    throw err;
  }
}

export async function findGroupByTitle(windowId: number, title: string) {
  const groups = await chrome.tabGroups.query({ windowId });
  return groups.find((g) => g.title === title);
}

export async function ensureGroup(windowId: number, title: string, color?: string) {
  const group = await findGroupByTitle(windowId, title);
  if (!group) return undefined;
  const normalizedColor = toGroupColor(color);
  if (group.title !== title || (normalizedColor && group.color !== normalizedColor)) {
    await updateGroupSafely(group.id, { title, color: normalizedColor });
  }
  return group.id;
}

export async function moveTabToGroup(tabId: number, windowId: number, title: string, color?: string) {
  const normalizedColor = toGroupColor(color);
  let group = await findGroupByTitle(windowId, title);
  if (!group) {
    const groupId = await chrome.tabs.group({ tabIds: [tabId], createProperties: { windowId } });
    await updateGroupSafely(groupId, { title, color: normalizedColor });
    return;
  }
  await chrome.tabs.group({ tabIds: [tabId], groupId: group.id });
  if (normalizedColor && group.color !== normalizedColor) {
    await updateGroupSafely(group.id, { color: normalizedColor });
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
  const { startIndex, groupedIds, ungroupedIds } = buildGroupedFirstUnpinnedOrder(
    orderedByIndex.map((tab) => ({
      id: tab.id!,
      index: tab.index,
      groupId: tab.groupId,
      pinned: tab.pinned
    }))
  );
  const targetUnpinnedIds = [...groupedIds, ...ungroupedIds];
  if (currentUnpinnedIds.length !== targetUnpinnedIds.length) return;
  const changed = currentUnpinnedIds.some((id, index) => id !== targetUnpinnedIds[index]);
  if (!changed) return;
  if (ungroupedIds.length === 0) return;
  await chrome.tabs.move(ungroupedIds, { index: startIndex + groupedIds.length });
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
