import { describe, expect, it } from 'vitest';
import { applyTheme, normalizeThemeMode, resolveEffectiveTheme } from '../../src/extension/theme.js';

describe('theme helpers', () => {
  it('normalizes stored mode', () => {
    expect(normalizeThemeMode('light')).toBe('light');
    expect(normalizeThemeMode('dark')).toBe('dark');
    expect(normalizeThemeMode('system')).toBe('system');
    expect(normalizeThemeMode('invalid')).toBe('system');
  });

  it('resolves effective theme', () => {
    expect(resolveEffectiveTheme('system', true)).toBe('dark');
    expect(resolveEffectiveTheme('system', false)).toBe('light');
    expect(resolveEffectiveTheme('light', true)).toBe('light');
    expect(resolveEffectiveTheme('dark', false)).toBe('dark');
  });

  it('applies theme data attributes', () => {
    const doc = { documentElement: { dataset: {} as Record<string, string> } } as unknown as Document;
    applyTheme('dark', doc, false);
    expect(doc.documentElement.dataset.themeMode).toBe('dark');
    expect(doc.documentElement.dataset.theme).toBe('dark');
    applyTheme('system', doc, true);
    expect(doc.documentElement.dataset.themeMode).toBe('system');
    expect(doc.documentElement.dataset.theme).toBe('dark');
  });
});
