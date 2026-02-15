import { describe, expect, it } from 'vitest';
import { parseConfigYaml } from '../../src/core/config.js';

const validYaml = `version: 2
applyMode: manual
groups:
  - name: Example
    color: blue
    rules:
      - pattern: 'example\\.com'
        matchMode: regex
`;

const v1Yaml = `version: 1
rules:
  - pattern: 'example\\.com'
    group: Example
`;

const defaultGlobYaml = `version: 2
groups:
  - name: GlobExample
    rules:
      - pattern: '*.example.com'
`;

const literalGroupNameYaml = `version: 2
groups:
  - name: 'Team-$1'
    rules:
      - pattern: '*example.com*'
`;

const varsYaml = `version: 2
vars:
  env: prod
groups:
  - name: Example
    rules:
      - pattern: '*example.com/\${env}*'
`;

const missingVarYaml = `version: 2
groups:
  - name: Example
    rules:
      - pattern: '*example.com/\${missing}*'
`;

const orderYaml = `version: 2
groups:
  - name: First
    rules:
      - pattern: '*first*'
      - pattern: '*first-2*'
  - name: Second
    rules:
      - pattern: '*second*'
`;

const strategyYaml = `version: 2
groupingStrategy: ruleFirst
groups:
  - name: Example
    rules:
      - pattern: '*example*'
`;

describe('parseConfigYaml', () => {
  it('parses valid v2 yaml', () => {
    const result = parseConfigYaml(validYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.version).toBe(2);
    expect(result.config?.rules[0].regex.test('example.com')).toBe(true);
    expect(result.config?.groupingStrategy).toBe('inheritFirst');
  });

  it('rejects v1 yaml', () => {
    const result = parseConfigYaml(v1Yaml);
    expect(result.config).toBeUndefined();
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('defaults matchMode to glob', () => {
    const result = parseConfigYaml(defaultGlobYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.rules[0].matchMode).toBe('glob');
    expect(result.config?.rules[0].regex.test('api.example.com')).toBe(true);
  });

  it('treats dynamic-like group names as literals', () => {
    const result = parseConfigYaml(literalGroupNameYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.groups[0].name).toBe('Team-$1');
    expect(result.config?.rules[0].groupName).toBe('Team-$1');
  });

  it('expands variables in rule pattern', () => {
    const result = parseConfigYaml(varsYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.rules[0].pattern).toContain('prod');
  });

  it('rejects missing variables', () => {
    const result = parseConfigYaml(missingVarYaml);
    expect(result.config).toBeUndefined();
    expect(result.errors[0].message).toContain('Unknown variable');
  });

  it('keeps yaml order (group order -> rule order)', () => {
    const result = parseConfigYaml(orderYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.rules.map((rule) => `${rule.groupName}:${rule.pattern}`)).toEqual([
      'First:*first*',
      'First:*first-2*',
      'Second:*second*'
    ]);
  });

  it('supports groupingStrategy setting', () => {
    const result = parseConfigYaml(strategyYaml);
    expect(result.errors).toHaveLength(0);
    expect(result.config?.groupingStrategy).toBe('ruleFirst');
  });
});
