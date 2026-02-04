import { describe, expect, it } from 'vitest';
import { getAdjacentGroup, orderGroupsByTabIndex } from '../../src/core/shortcuts.js';
import type { StateSnapshot } from '../../src/core/types.js';

const state: StateSnapshot = {
  tabs: [
    { id: 1, windowId: 1, groupId: 10, index: 2 },
    { id: 2, windowId: 1, groupId: 20, index: 0 },
    { id: 3, windowId: 1, groupId: 10, index: 1 }
  ],
  groups: [
    { id: 10, title: 'GroupA', windowId: 1 },
    { id: 20, title: 'GroupB', windowId: 1 }
  ]
};

describe('shortcuts', () => {
  it('orders groups by minimum tab index', () => {
    const ordered = orderGroupsByTabIndex(state);
    expect(ordered[0].id).toBe(20);
    expect(ordered[1].id).toBe(10);
  });

  it('moves to next group with wrap', () => {
    const ordered = orderGroupsByTabIndex(state);
    const next = getAdjacentGroup(ordered, 10, 'next');
    expect(next?.id).toBe(20);
    const wrap = getAdjacentGroup(ordered, 20, 'next');
    expect(wrap?.id).toBe(10);
  });

  it('uses last group when ungrouped and prev', () => {
    const ordered = orderGroupsByTabIndex(state);
    const prev = getAdjacentGroup(ordered, undefined, 'prev');
    expect(prev?.id).toBe(10);
  });
});
