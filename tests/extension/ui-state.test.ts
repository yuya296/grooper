import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { buildYamlFromUi, parseYamlForUi } from '../../src/extension/options/uiState.js';

describe('options ui state', () => {
  it('parses v2 yaml into ui state', () => {
    const yaml = `version: 2
applyMode: newTabs
groupingStrategy: ruleOnly
groups:
  - name: Example
    color: blue
    cleanup:
      ttlMinutes: 15
      maxTabs: 5
      lru: true
    rules:
      - pattern: 'example\\.com'
        matchMode: regex
`;
    const result = parseYamlForUi(yaml);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.uiState.applyMode).toBe('newTabs');
    expect(result.uiState.groupingStrategy).toBe('ruleOnly');
    expect(result.uiState.groups).toHaveLength(1);
    expect(result.uiState.groups[0].name).toBe('Example');
    expect(result.uiState.groups[0].color).toBe('blue');
    expect(result.uiState.groups[0].ttlMinutes).toBe(15);
    expect(result.uiState.groups[0].rules[0].matchMode).toBe('regex');
  });

  it('builds yaml from ui state while keeping extra keys', () => {
    const rawConfig = {
      version: 2,
      vars: { env: 'prod' },
      shortcuts: { slots: ['Work'] },
      applyMode: 'manual',
      groupingStrategy: 'inheritFirst',
      groups: []
    };
    const uiState = {
      applyMode: 'always' as const,
      groupingStrategy: 'ruleFirst' as const,
      groups: [
        {
          name: 'Example',
          color: 'red',
          ttlMinutes: 15,
          maxTabs: 5,
          lru: true,
          rules: [{ pattern: 'example\\.com', matchMode: 'glob' as const }]
        }
      ]
    };
    const result = buildYamlFromUi(rawConfig, uiState);
    const parsed = parse(result.yaml) as Record<string, any>;
    expect(parsed.applyMode).toBe('always');
    expect(parsed.groupingStrategy).toBe('ruleFirst');
    expect(parsed.vars.env).toBe('prod');
    expect(parsed.shortcuts.slots[0]).toBe('Work');
    expect(parsed.groups[0].name).toBe('Example');
    expect(parsed.groups[0].cleanup.ttlMinutes).toBe(15);
    expect(parsed.groups[0].cleanup.maxTabs).toBe(5);
    expect(parsed.groups[0].cleanup.lru).toBe(true);
    expect(parsed.groups[0].rules[0].pattern).toBe('example\\.com');
    expect(parsed.groups[0].rules[0].matchMode).toBeUndefined();
  });

  it('removes legacy keys when converting from ui state', () => {
    const rawConfig = {
      version: 1,
      parentFollow: true,
      fallbackGroup: 'Legacy',
      groupingPriority: 'ruleFirst',
      rules: [{ pattern: 'old', group: 'Old' }]
    };
    const result = buildYamlFromUi(rawConfig, {
      applyMode: 'manual',
      groupingStrategy: 'inheritFirst',
      groups: []
    });
    const parsed = parse(result.yaml) as Record<string, any>;
    expect(parsed.version).toBe(2);
    expect(parsed.parentFollow).toBeUndefined();
    expect(parsed.fallbackGroup).toBeUndefined();
    expect(parsed.groupingPriority).toBeUndefined();
    expect(parsed.rules).toBeUndefined();
  });
});
