import { describe, expect, it } from 'vitest';
import { parseConfigYaml } from '../../src/core/config.js';

const validYaml = `version: 1
applyMode: manual
rules:
  - pattern: "example\\.com"
    group: "Example"
`;

const invalidRegex = `version: 1
rules:
  - pattern: "("
    group: "Bad"
`;

describe('parseConfigYaml', () => {
  it('parses valid yaml', () => {
    const result = parseConfigYaml(validYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.rules[0].regex.test('https://example.com')).toBe(true);
  });

  it('rejects invalid regex', () => {
    const result = parseConfigYaml(invalidRegex);
    expect(result.config).toBeUndefined();
    expect(result.errors[0].path).toBe('rules.0.pattern');
  });
});
