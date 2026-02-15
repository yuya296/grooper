import { describe, expect, it } from 'vitest';
import { buildCleanupActions } from '../../src/core/cleanup.js';
import { fixedClock } from '../../src/core/clock.js';
import type { CompiledConfig, StateSnapshot } from '../../src/core/types.js';

const clock = fixedClock(1_000_000);

const config: CompiledConfig = {
  version: 1,
  applyMode: 'manual',
  vars: {},
  fallbackGroup: undefined,
  parentFollow: true,
  groupingPriority: 'inheritFirst',
  groups: {
    Example: { ttlMinutes: 10, maxTabs: 1, lru: true }
  },
  rules: []
};

const state: StateSnapshot = {
  tabs: [
    { id: 1, windowId: 1, groupId: 10, lastActiveAt: 1_000_000 - 20 * 60 * 1000 },
    { id: 2, windowId: 1, groupId: 10, lastActiveAt: 1_000_000 - 5 * 60 * 1000 },
    { id: 3, windowId: 1, groupId: 10, lastActiveAt: 1_000_000 - 2 * 60 * 1000 }
  ],
  groups: [{ id: 10, title: 'Example', windowId: 1 }]
};

describe('buildCleanupActions', () => {
  it('closes tabs exceeding TTL', () => {
    const actions = buildCleanupActions(state, config, clock);
    expect(actions.some((a) => a.type === 'closeTab' && a.tabId === 1)).toBe(true);
  });

  it('closes tabs exceeding maxTabs by LRU', () => {
    const actions = buildCleanupActions(state, config, clock);
    const closed = actions.filter((a) => a.type === 'closeTab').map((a) => a.tabId);
    expect(closed).toContain(1);
    expect(closed.length).toBeGreaterThanOrEqual(2);
  });
});
