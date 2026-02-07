import { describe, expect, it } from 'vitest';
import { createPlan } from '../../src/core/planner.js';
import type { CompiledConfig, StateSnapshot } from '../../src/core/types.js';

const config: CompiledConfig = {
  version: 1,
  applyMode: 'manual',
  vars: {},
  fallbackGroup: undefined,
  parentFollow: true,
  groups: {},
  rules: [
    { pattern: 'example\\.com', group: 'Example', matchMode: 'regex', regex: /example\.com/, index: 0, priority: 0 }
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

  it('follows parent group when enabled', () => {
    const plan = createPlan(
      {
        tabs: [
          { id: 1, url: 'https://parent.com', windowId: 1, groupId: 9 },
          { id: 2, url: 'https://child.com', windowId: 1, openerTabId: 1 }
        ],
        groups: [{ id: 9, title: 'ParentGroup', windowId: 1 }]
      },
      config
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 2);
    expect(move).toMatchObject({ group: 'ParentGroup' });
  });

  it('applies fallback when no match', () => {
    const fallbackConfig: CompiledConfig = { ...config, fallbackGroup: 'Fallback' };
    const plan = createPlan(
      {
        tabs: [{ id: 3, url: 'https://none.com', windowId: 1 }],
        groups: []
      },
      fallbackConfig
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 3);
    expect(move).toMatchObject({ group: 'Fallback' });
  });

  it('respects scope tab ids', () => {
    const scoped = createPlan(state, config, { scopeTabIds: new Set([2]) });
    const move = scoped.actions.find((a) => a.type === 'moveTab');
    expect(move).toBeUndefined();
  });

  it('expands regex captures into group template', () => {
    const captureConfig: CompiledConfig = {
      ...config,
      rules: [
        {
          pattern: '^https://([a-z0-9-]+)\\.example\\.com/',
          group: 'Team-$1',
          matchMode: 'regex',
          regex: /^https:\/\/([a-z0-9-]+)\.example\.com\//,
          index: 0,
          priority: 0
        }
      ]
    };
    const plan = createPlan(
      {
        tabs: [{ id: 11, url: 'https://dev.example.com/home', windowId: 1 }],
        groups: []
      },
      captureConfig
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 11);
    expect(move).toMatchObject({ group: 'Team-dev' });
  });

  it('expands named capture into group template', () => {
    const namedCaptureConfig: CompiledConfig = {
      ...config,
      rules: [
        {
          pattern: '^https?://example\\.com/(?<env>[^/]+)(?:/.*)?$',
          group: 'Example:$<env>',
          matchMode: 'regex',
          regex: /^https?:\/\/example\.com\/(?<env>[^/]+)(?:\/.*)?$/,
          index: 0,
          priority: 0
        }
      ]
    };
    const plan = createPlan(
      {
        tabs: [{ id: 12, url: 'https://example.com/fuga/aaa', windowId: 1 }],
        groups: []
      },
      namedCaptureConfig
    );
    const move = plan.actions.find((a) => a.type === 'moveTab' && a.tabId === 12);
    expect(move).toMatchObject({ group: 'Example:fuga' });
  });
});
