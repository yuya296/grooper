import { afterEach, describe, expect, it, vi } from 'vitest';
import { detectBrowserLocale, normalizeLocale, t } from '../../src/extension/i18n.js';

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('i18n helpers', () => {
  it('normalizes locale values', () => {
    expect(normalizeLocale('ja')).toBe('ja');
    expect(normalizeLocale('en')).toBe('en');
    expect(normalizeLocale('fr')).toBe('ja');
  });

  it('detects browser locale from navigator when chrome.i18n is unavailable', () => {
    vi.stubGlobal('chrome', undefined);
    vi.stubGlobal('navigator', { language: 'en-US' });
    expect(detectBrowserLocale()).toBe('en');
  });

  it('interpolates localized messages', () => {
    expect(t('ja', 'options.table.groupFallback', { index: 2 })).toBe('Group 2');
    expect(t('en', 'popup.error', { message: 'oops' })).toBe('Error: oops');
  });
});
