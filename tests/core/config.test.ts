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
const varsYaml = `version: 1
vars:
  env: prod
rules:
  - pattern: "example\\\\.com/${env}"
    group: "Example-${env}"
`;

const missingVarYaml = `version: 1
rules:
  - pattern: "example\\\\.com/${missing}"
    group: "Example"
`;

const priorityYaml = `version: 1
rules:
  - pattern: "b"
    group: "B"
    priority: 1
  - pattern: "a"
    group: "A"
    priority: 2
`;

const unknownKeyYaml = `version: 1
rules: []
unknownKey: true
`;

const fallbackNoneYaml = `version: 1
fallbackGroup: none
rules: []
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

  it('expands variables', () => {
    const result = parseConfigYaml(varsYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.rules[0].pattern).toBe('example\\\\.com/prod');
    expect(result.config?.rules[0].group).toBe('Example-prod');
  });

  it('rejects missing variables', () => {
    const result = parseConfigYaml(missingVarYaml);
    expect(result.config).toBeUndefined();
    expect(result.errors[0].message).toContain('Unknown variable');
  });

  it('sorts rules by priority then order', () => {
    const result = parseConfigYaml(priorityYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.rules[0].group).toBe('A');
  });

  it('rejects unknown keys', () => {
    const result = parseConfigYaml(unknownKeyYaml);
    expect(result.config).toBeUndefined();
  });

  it('treats fallbackGroup none as unset', () => {
    const result = parseConfigYaml(fallbackNoneYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.fallbackGroup).toBeUndefined();
  });
});
