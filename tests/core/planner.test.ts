import { describe, expect, it } from 'vitest';
import { createPlan } from '../../src/core/planner.js';
import type { CompiledConfig, StateSnapshot } from '../../src/core/types.js';

const config: CompiledConfig = {
  version: 1,
  applyMode: 'manual',
  rules: [
    { pattern: 'example\\.com', group: 'Example', regex: /example\.com/, index: 0 }
  ]
};

const state: StateSnapshot = {
  tabs: [
    { id: 1, url: 'https://example.com', windowId: 1 },
    { id: 2, url: 'https://other.com', windowId: 1 }
  ],
  groups: []
};

describe('createPlan', () => {
  it('creates move plan for matching tabs', () => {
    const plan = createPlan(state, config);
    const move = plan.actions.find((a) => a.type === 'moveTab');
    expect(move).toMatchObject({ tabId: 1, group: 'Example', windowId: 1 });
  });
});
