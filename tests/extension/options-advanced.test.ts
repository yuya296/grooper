import { describe, expect, it } from 'vitest';
import { appendHistoryEntry, formatPreviewActions, popLatestHistory } from '../../src/extension/options/advanced.js';

describe('options advanced helpers', () => {
  it('appends history entry to head and trims to 20', () => {
    const history = Array.from({ length: 20 }, (_, i) => ({
      timestamp: `2026-02-07T00:00:${String(i).padStart(2, '0')}.000Z`,
      yaml: `v${i}`
    }));

    const next = appendHistoryEntry(history, 'new', '2026-02-07T01:00:00.000Z');
    expect(next).toHaveLength(20);
    expect(next[0]).toEqual({ timestamp: '2026-02-07T01:00:00.000Z', yaml: 'new' });
    expect(next[19].yaml).toBe('v18');
  });

  it('pops latest history entry for rollback', () => {
    const history = [
      { timestamp: '2026-02-07T01:00:00.000Z', yaml: 'latest' },
      { timestamp: '2026-02-07T00:00:00.000Z', yaml: 'older' }
    ];
    const result = popLatestHistory(history);
    expect(result).not.toBeNull();
    expect(result?.latest.yaml).toBe('latest');
    expect(result?.remaining).toEqual([{ timestamp: '2026-02-07T00:00:00.000Z', yaml: 'older' }]);
  });

  it('formats preview actions into display lines', () => {
    const text = formatPreviewActions([
      { type: 'ensureGroup', group: 'Work', windowId: 1 },
      { type: 'moveTab', tabId: 10, group: 'Work', windowId: 1 },
      { type: 'closeTab', tabId: 20, reason: 'ttl' },
      { type: 'log', level: 'info', message: 'noop' }
    ]);

    expect(text).toBe('ensure group Work\nmove tab 10 -> Work\nclose tab 20 (ttl)\nlog');
  });
});
