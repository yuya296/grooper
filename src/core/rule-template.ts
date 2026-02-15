import type { MatchMode } from './types.js';

export function globToRegexPattern(glob: string): string {
  let pattern = '^';
  for (let i = 0; i < glob.length; i += 1) {
    const ch = glob[i];
    if (ch === '*') {
      pattern += '.*';
      continue;
    }
    if (ch === '?') {
      pattern += '.';
      continue;
    }
    if (ch === '\\') {
      const next = glob[i + 1];
      if (next) {
        pattern += next.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        i += 1;
        continue;
      }
    }
    pattern += ch.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
  pattern += '$';
  return pattern;
}

export function compileRulePattern(pattern: string, matchMode: MatchMode): RegExp {
  return new RegExp(matchMode === 'glob' ? globToRegexPattern(pattern) : pattern);
}

export function validateRulePattern(pattern: string, matchMode: MatchMode): string | null {
  try {
    compileRulePattern(pattern, matchMode);
    return null;
  } catch (err) {
    return err instanceof Error ? err.message : 'Invalid regex';
  }
}
