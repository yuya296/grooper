import { describe, expect, it } from 'vitest';
import { parseConfigYaml } from '../../src/core/config.js';
import { DEFAULT_CONFIG_YAML } from '../../src/extension/storage.js';

function findMatchedGroup(url: string): string | undefined {
  const result = parseConfigYaml(DEFAULT_CONFIG_YAML);
  if (result.errors.length > 0 || !result.config) return undefined;
  for (const rule of result.config.rules) {
    if (rule.regex.test(url)) return rule.groupName;
  }
  return undefined;
}

describe('default config preset', () => {
  it('is valid and uses newTabs mode', () => {
    const result = parseConfigYaml(DEFAULT_CONFIG_YAML);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.applyMode).toBe('newTabs');
    expect(result.config?.groupingStrategy).toBe('inheritFirst');
    expect(result.config?.rules.length).toBeGreaterThanOrEqual(10);
  });

  it('matches common sites into expected groups', () => {
    expect(findMatchedGroup('https://github.com/openai/openai-python')).toBe('Work');
    expect(findMatchedGroup('https://docs.google.com/document/d/abc123/edit')).toBe('Docs');
    expect(findMatchedGroup('https://www.google.com/search?q=grooper')).toBe('Search');
    expect(findMatchedGroup('https://www.youtube.com/watch?v=dQw4w9WgXcQ')).toBe('Media');
    expect(findMatchedGroup('https://x.com/home')).toBe('Social');
  });

  it('does not force-group unmatched sites by default', () => {
    expect(findMatchedGroup('https://example.invalid/')).toBeUndefined();
  });
});
