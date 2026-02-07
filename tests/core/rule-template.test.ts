import { describe, expect, it } from 'vitest';
import {
  containsGroupCaptureReference,
  expandGroupCaptures,
  validateGroupTemplateForMatchMode
} from '../../src/core/rule-template.js';

describe('rule template helpers', () => {
  it('detects capture references', () => {
    expect(containsGroupCaptureReference('Example:$1')).toBe(true);
    expect(containsGroupCaptureReference('Example:$<env>')).toBe(true);
    expect(containsGroupCaptureReference('Example:$$1')).toBe(false);
    expect(containsGroupCaptureReference('Example:${env}')).toBe(false);
  });

  it('validates capture template by match mode', () => {
    expect(validateGroupTemplateForMatchMode('Example:$1', 'glob')).toContain('globモード');
    expect(validateGroupTemplateForMatchMode('Example:$<env>', 'regex')).toBeNull();
  });

  it('expands numbered and named captures', () => {
    const match = 'https://example.com/hoge/foo'.match(/^https:\/\/example\.com\/(?<env>[^/]+)\/(.*)$/);
    expect(match).toBeTruthy();
    if (!match) return;
    expect(expandGroupCaptures('Example:$1', match)).toBe('Example:hoge');
    expect(expandGroupCaptures('Example:$<env>', match)).toBe('Example:hoge');
    expect(expandGroupCaptures('Path:$2', match)).toBe('Path:foo');
  });

  it('handles $$ and missing captures safely', () => {
    const match = 'https://example.com/hoge'.match(/^https:\/\/example\.com\/([^/]+)$/);
    expect(match).toBeTruthy();
    if (!match) return;
    expect(expandGroupCaptures('Price:$$100', match)).toBe('Price:$100');
    expect(expandGroupCaptures('Example:$2', match)).toBe('Example:');
    expect(expandGroupCaptures('Example:$<missing>', match)).toBe('Example:');
  });
});
