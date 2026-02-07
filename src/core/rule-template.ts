import type { MatchMode } from './types.js';

export function containsGroupCaptureReference(template: string): boolean {
  for (let i = 0; i < template.length; i += 1) {
    if (template[i] !== '$') continue;
    const next = template[i + 1];
    if (!next) continue;
    if (next === '$') {
      i += 1;
      continue;
    }
    if (/[1-9]/.test(next)) return true;
    if (next === '<') {
      const end = template.indexOf('>', i + 2);
      if (end !== -1 && end > i + 2) return true;
    }
  }
  return false;
}

export function validateGroupTemplateForMatchMode(group: string, matchMode: MatchMode): string | null {
  if (matchMode === 'glob' && containsGroupCaptureReference(group)) {
    return 'globモードではgroupにキャプチャ参照（$1, $<name>）は使えません';
  }
  return null;
}

export function expandGroupCaptures(template: string, match: RegExpMatchArray): string {
  let out = '';
  for (let i = 0; i < template.length; i += 1) {
    const ch = template[i];
    if (ch !== '$') {
      out += ch;
      continue;
    }
    const next = template[i + 1];
    if (!next) {
      out += '$';
      continue;
    }
    if (next === '$') {
      out += '$';
      i += 1;
      continue;
    }
    if (/[1-9]/.test(next)) {
      let j = i + 1;
      while (j < template.length && /[0-9]/.test(template[j])) j += 1;
      const captureIndex = Number(template.slice(i + 1, j));
      out += match[captureIndex] ?? '';
      i = j - 1;
      continue;
    }
    if (next === '<') {
      const end = template.indexOf('>', i + 2);
      if (end !== -1) {
        const name = template.slice(i + 2, end);
        out += (match.groups?.[name] as string | undefined) ?? '';
        i = end;
        continue;
      }
    }
    out += '$';
  }
  return out;
}
