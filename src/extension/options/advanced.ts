import type { PlanAction } from '../../core/types.js';

export interface HistoryEntry {
  timestamp: string;
  yaml: string;
}

export const HISTORY_LIMIT = 20;

export function appendHistoryEntry(history: HistoryEntry[], previousYaml: string, timestamp: string): HistoryEntry[] {
  return [{ timestamp, yaml: previousYaml }, ...history].slice(0, HISTORY_LIMIT);
}

export function popLatestHistory(
  history: HistoryEntry[]
): { latest: HistoryEntry; remaining: HistoryEntry[] } | null {
  if (history.length === 0) return null;
  const [latest, ...remaining] = history;
  return { latest, remaining };
}

export function formatPreviewActions(actions: PlanAction[]): string {
  return actions
    .map((action) => {
      if (action.type === 'moveTab') return `move tab ${action.tabId} -> ${action.group}`;
      if (action.type === 'ensureGroup') return `ensure group ${action.group}`;
      if (action.type === 'closeTab') return `close tab ${action.tabId} (${action.reason})`;
      return `${action.type}`;
    })
    .join('\n');
}
