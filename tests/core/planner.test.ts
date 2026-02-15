import { describe, expect, it } from 'vitest';
import { createPlan } from '../../src/core/planner.js';
import type { CompiledConfig, CompiledGroup, CompiledRule, StateSnapshot } from '../../src/core/types.js';

function buildConfig(rule?: Partial<CompiledRule>, strategy: CompiledConfig['groupingStrategy'] = 'inheritFirst'): CompiledConfig {
  const baseRule: CompiledRule = {
    pattern: 'example\\.com',
    groupName: 'Example',
    groupColor: 'blue',
    matchMode: 'regex',
    regex: /example\.com/,
    index: 0
  };
  const mergedRule: CompiledRule = { ...baseRule, ...rule };
  const group: CompiledGroup = {
    name: mergedRule.groupName,
    color: mergedRule.groupColor,
    cleanup: {},
    rules: [mergedRule]
  };
  return {
    version: 2,
    applyMode: 'manual',
    vars: {},
    groupingStrategy: strategy,
    groups: [group],
    groupsByName: { [group.name]: group },
    shortcuts: undefined,
    rules: [mergedRule]
  };
}

const state: StateSnapshot = {
  tabs: [
    { id: 1, url: 'https://example.com', windowId: 1 },
    { id: 2, url: 'https://other.com', windowId: 1 }
  ],
  groups: []
};

describe('createPlan', () => {
  it('creates move plan for matching tabs', () => {
    const plan = createPlan(state, buildConfig());
    const move = plan.actions.find((a) => a.type === 'moveTab');
    expect(move).toMatchObject({ tabId: 1, group: 'Example', windowId: 1 });
  });

  it('uses inheritFirst by default (parent group wins)', () => {
    const plan = createPlan(
      {
        tabs: [
          { id: 1, url: 'https://parent.com', windowId: 1, groupId: 9 },
          { id: 2, url: 'https://example.com', windowId: 1, openerTabId: 1 }
        ],
        groups: [{ id: 9, title: 'ParentGroup', windowId: 1 }]
      },
      buildConfig()
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 2);
    expect(move).toMatchObject({ group: 'ParentGroup' });
  });

  it('can prioritize rule match over parent group when ruleFirst', () => {
    const plan = createPlan(
      {
        tabs: [
          { id: 1, url: 'https://parent.com', windowId: 1, groupId: 9 },
          { id: 2, url: 'https://example.com', windowId: 1, openerTabId: 1 }
        ],
        groups: [{ id: 9, title: 'ParentGroup', windowId: 1 }]
      },
      buildConfig(undefined, 'ruleFirst')
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 2);
    expect(move).toMatchObject({ group: 'Example' });
  });

  it('ignores parent group when ruleOnly', () => {
    const plan = createPlan(
      {
        tabs: [
          { id: 1, url: 'https://parent.com', windowId: 1, groupId: 9 },
          { id: 2, url: 'https://no-match.com', windowId: 1, openerTabId: 1 }
        ],
        groups: [{ id: 9, title: 'ParentGroup', windowId: 1 }]
      },
      buildConfig(undefined, 'ruleOnly')
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 2);
    expect(move).toBeUndefined();
  });

  it('does not move unmatched tabs (fallback removed)', () => {
    const plan = createPlan(
      {
        tabs: [{ id: 3, url: 'https://none.com', windowId: 1 }],
        groups: []
      },
      buildConfig()
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 3);
    expect(move).toBeUndefined();
  });

  it('uses group color from parent group definition', () => {
    const plan = createPlan(state, buildConfig());
    const ensure = plan.actions.find((a) => a.type === 'ensureGroup');
    expect(ensure).toMatchObject({ group: 'Example', color: 'blue' });
  });

  it('respects scope tab ids', () => {
    const scoped = createPlan(state, buildConfig(), { scopeTabIds: new Set([2]) });
    const move = scoped.actions.find((a) => a.type === 'moveTab');
    expect(move).toBeUndefined();
  });

  it('keeps group name literal (no capture expansion)', () => {
    const plan = createPlan(
      {
        tabs: [{ id: 11, url: 'https://dev.example.com/home', windowId: 1 }],
        groups: []
      },
      buildConfig({
        pattern: '^https://([a-z0-9-]+)\\.example\\.com/',
        matchMode: 'regex',
        regex: /^https:\/\/([a-z0-9-]+)\.example\.com\//,
        groupName: 'Team-$1',
        groupColor: 'cyan'
      })
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 11);
    expect(move).toMatchObject({ group: 'Team-$1' });
  });
});
