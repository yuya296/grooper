import { describe, expect, it } from 'vitest';
import { compileRulePattern, globToRegexPattern, validateRulePattern } from '../../src/core/rule-template.js';

describe('rule template helpers', () => {
  it('converts glob pattern to regex source', () => {
    expect(globToRegexPattern('*.example.com/*')).toBe('^.*\\.example\\.com/.*$');
  });

  it('compiles regex and glob patterns', () => {
    const regex = compileRulePattern('example\\.com', 'regex');
    expect(regex.test('https://example.com')).toBe(true);

    const glob = compileRulePattern('*.example.com/*', 'glob');
    expect(glob.test('api.example.com/path')).toBe(true);
  });

  it('validates pattern syntax', () => {
    expect(validateRulePattern('(', 'regex')).toContain('Unterminated');
    expect(validateRulePattern('*.example.com/*', 'glob')).toBeNull();
  });
});
