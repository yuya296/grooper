import type { GroupState, StateSnapshot, TabState } from './types.js';

export function orderGroupsByTabIndex(state: StateSnapshot): GroupState[] {
  const minIndexByGroup = new Map<number, number>();
  for (const tab of state.tabs) {
    if (tab.groupId == null || tab.groupId < 0 || tab.index == null) continue;
    const current = minIndexByGroup.get(tab.groupId);
    const index = tab.index;
    if (current == null || index < current) {
      minIndexByGroup.set(tab.groupId, index);
    }
  }
  return [...state.groups]
    .map((group) => ({ group, index: minIndexByGroup.get(group.id) ?? Number.MAX_SAFE_INTEGER }))
    .sort((a, b) => a.index - b.index)
    .map((entry) => entry.group);
}

export function getAdjacentGroup(
  orderedGroups: GroupState[],
  currentGroupId: number | undefined,
  direction: 'next' | 'prev'
): GroupState | undefined {
  if (orderedGroups.length === 0) return undefined;
  const currentIndex = currentGroupId == null ? -1 : orderedGroups.findIndex((g) => g.id === currentGroupId);
  const delta = direction === 'next' ? 1 : -1;
  let nextIndex = currentIndex + delta;
  if (currentIndex === -1) {
    nextIndex = direction === 'next' ? 0 : orderedGroups.length - 1;
  } else if (nextIndex < 0) {
    nextIndex = orderedGroups.length - 1;
  } else if (nextIndex >= orderedGroups.length) {
    nextIndex = 0;
  }
  return orderedGroups[nextIndex];
}

export function buildShortcutState(tabs: TabState[], groups: GroupState[]): StateSnapshot {
  return { tabs, groups };
}
