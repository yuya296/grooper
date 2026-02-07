import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { buildYamlFromUi, parseYamlForUi } from '../../src/extension/options/uiState.js';

describe('options ui state', () => {
  it('parses yaml into ui state and preserves raw config', () => {
    const yaml = `version: 1
applyMode: newTabs
fallbackGroup: "Fallback"
rules:
  - pattern: 'example\\.com'
    group: 'Example'
    color: 'blue'
`;
    const result = parseYamlForUi(yaml);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.uiState.applyMode).toBe('newTabs');
    expect(result.uiState.rules).toHaveLength(1);
    expect(result.uiState.rules[0].pattern).toBe('example\\.com');
    expect(result.rawConfig.fallbackGroup).toBe('Fallback');
  });

  it('builds yaml from ui state while keeping extra keys', () => {
    const rawConfig = {
      version: 1,
      vars: { env: 'prod' },
      groups: { Example: { maxTabs: 3 } },
      applyMode: 'manual',
      rules: [{ pattern: 'old', group: 'Old' }]
    };
    const uiState = {
      applyMode: 'always' as const,
      rules: [{ pattern: 'example\\.com', group: 'Example', color: 'blue', priority: 2 }]
    };
    const result = buildYamlFromUi(rawConfig, uiState);
    const parsed = parse(result.yaml) as Record<string, any>;
    expect(parsed.applyMode).toBe('always');
    expect(parsed.vars.env).toBe('prod');
    expect(parsed.groups.Example.maxTabs).toBe(3);
    expect(parsed.rules).toHaveLength(1);
    expect(parsed.rules[0].group).toBe('Example');
    expect(parsed.rules[0].priority).toBe(2);
  });
});
