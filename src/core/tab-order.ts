export interface TabOrderInput {
  id: number;
  index?: number;
  groupId?: number;
  pinned?: boolean;
}

export interface GroupedFirstPlan {
  startIndex: number;
  groupedIds: number[];
  ungroupedIds: number[];
}

function byIndexAsc(a: TabOrderInput, b: TabOrderInput): number {
  const ai = a.index ?? Number.MAX_SAFE_INTEGER;
  const bi = b.index ?? Number.MAX_SAFE_INTEGER;
  return ai - bi;
}

export function buildGroupedFirstUnpinnedOrder(tabs: TabOrderInput[]): GroupedFirstPlan {
  const ordered = [...tabs].sort(byIndexAsc);
  const unpinned = ordered.filter((tab) => tab.pinned !== true);
  const grouped = unpinned.filter((tab) => tab.groupId != null && tab.groupId >= 0);
  const ungrouped = unpinned.filter((tab) => tab.groupId == null || tab.groupId < 0);

  const startIndex = (() => {
    const first = unpinned[0];
    if (!first || first.index == null) return 0;
    return first.index;
  })();

  return {
    startIndex,
    groupedIds: grouped.map((tab) => tab.id),
    ungroupedIds: ungrouped.map((tab) => tab.id)
  };
}
