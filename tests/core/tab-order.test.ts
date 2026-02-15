import { describe, expect, it } from 'vitest';
import { buildGroupedFirstUnpinnedOrder } from '../../src/core/tab-order.js';

describe('tab order', () => {
  it('orders unpinned tabs as grouped first then ungrouped', () => {
    const result = buildGroupedFirstUnpinnedOrder([
      { id: 1, index: 0, pinned: true },
      { id: 2, index: 1, groupId: -1 },
      { id: 3, index: 2, groupId: 10 },
      { id: 4, index: 3, groupId: -1 },
      { id: 5, index: 4, groupId: 11 }
    ]);

    expect(result.startIndex).toBe(1);
    expect(result.tabIds).toEqual([3, 5, 2, 4]);
  });

  it('keeps relative order within grouped and ungrouped subsets', () => {
    const result = buildGroupedFirstUnpinnedOrder([
      { id: 10, index: 5, groupId: 20 },
      { id: 11, index: 6, groupId: 20 },
      { id: 12, index: 7, groupId: -1 },
      { id: 13, index: 8, groupId: -1 }
    ]);

    expect(result.tabIds).toEqual([10, 11, 12, 13]);
  });
});
