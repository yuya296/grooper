import { describe, expect, it } from 'vitest';
import { applyPlan, ensureConfig } from '../../src/cli/lib.js';
import type { Plan, StateSnapshot } from '../../src/core/types.js';

describe('cli lib', () => {
  it('ensures valid config yaml', () => {
    const config = ensureConfig(`version: 1
rules:
  - pattern: 'example\\.com'
    group: 'Example'
`);
    expect(config.rules).toHaveLength(1);
    expect(config.rules[0].group).toBe('Example');
  });

  it('throws for invalid config yaml', () => {
    expect(() =>
      ensureConfig(`version: 1
rules:
  - pattern: '('
    group: 'Broken'
`)
    ).toThrow();
  });

  it('applies ensure/move/close actions to snapshot state', () => {
    const state: StateSnapshot = {
      tabs: [
        { id: 1, url: 'https://example.com', windowId: 1 },
        { id: 2, url: 'https://example.org', windowId: 1, groupId: 8 }
      ],
      groups: [{ id: 8, title: 'Legacy', windowId: 1 }]
    };
    const plan: Plan = {
      actions: [
        { type: 'ensureGroup', group: 'Example', color: 'blue', windowId: 1 },
        { type: 'moveTab', tabId: 1, group: 'Example', windowId: 1 },
        { type: 'closeTab', tabId: 2, reason: 'cleanup' }
      ]
    };

    const next = applyPlan(state, plan);
    const example = next.groups.find((g) => g.title === 'Example');
    expect(example).toBeDefined();
    expect(example?.color).toBe('blue');
    expect(next.tabs.find((t) => t.id === 1)?.groupId).toBe(example?.id);
    expect(next.tabs.some((t) => t.id === 2)).toBe(false);
  });
});
