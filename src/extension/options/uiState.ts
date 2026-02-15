import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { parseConfigYaml } from '../../core/config.js';
import type { GroupingStrategy, MatchMode } from '../../core/types.js';

export interface RuleForm {
  pattern: string;
  matchMode: MatchMode;
}

export interface GroupForm {
  name: string;
  color?: string;
  ttlMinutes?: number;
  maxTabs?: number;
  lru?: boolean;
  rules: RuleForm[];
}

export interface UiState {
  applyMode: 'manual' | 'newTabs' | 'always';
  groupingStrategy: GroupingStrategy;
  groups: GroupForm[];
}

export type UiParseResult =
  | { ok: true; uiState: UiState; rawConfig: Record<string, unknown> }
  | { ok: false; errors: string[] };

function normalizePositiveNumber(value: unknown): number | undefined {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return num;
}

export function parseYamlForUi(yamlText: string): UiParseResult {
  let raw: unknown;
  try {
    raw = parseYaml(yamlText) ?? {};
  } catch (err) {
    return {
      ok: false,
      errors: [`yaml: ${err instanceof Error ? err.message : 'parse error'}`]
    };
  }

  const validation = parseConfigYaml(yamlText);
  if (validation.errors.length > 0 || !validation.config) {
    return {
      ok: false,
      errors: validation.errors.map((e) => `${e.path}: ${e.message}`)
    };
  }

  if (raw == null || typeof raw !== 'object') {
    return { ok: false, errors: ['config: invalid structure'] };
  }

  const compiled = validation.config;
  const groups: GroupForm[] = compiled.groups.map((group) => ({
    name: group.name,
    color: group.color,
    ttlMinutes: normalizePositiveNumber(group.cleanup.ttlMinutes),
    maxTabs: normalizePositiveNumber(group.cleanup.maxTabs),
    lru: group.cleanup.lru === true ? true : undefined,
    rules: group.rules.map((rule) => ({
      pattern: rule.pattern,
      matchMode: rule.matchMode
    }))
  }));

  return {
    ok: true,
    uiState: {
      applyMode: compiled.applyMode,
      groupingStrategy: compiled.groupingStrategy,
      groups
    },
    rawConfig: raw as Record<string, unknown>
  };
}

export function buildYamlFromUi(
  rawConfig: Record<string, unknown> | null,
  uiState: UiState
): { yaml: string; rawConfig: Record<string, unknown> } {
  const nextConfig: Record<string, unknown> =
    rawConfig && typeof rawConfig === 'object' ? { ...rawConfig } : { version: 2 };

  nextConfig.version = 2;
  nextConfig.applyMode = uiState.applyMode;
  nextConfig.groupingStrategy = uiState.groupingStrategy;

  delete nextConfig.fallbackGroup;
  delete nextConfig.parentFollow;
  delete nextConfig.groupingPriority;
  delete nextConfig.rules;

  nextConfig.groups = uiState.groups.map((group) => {
    const entry: Record<string, unknown> = {
      name: group.name,
      rules: group.rules.map((rule) => {
        const ruleEntry: Record<string, unknown> = { pattern: rule.pattern };
        if (rule.matchMode === 'regex') ruleEntry.matchMode = 'regex';
        return ruleEntry;
      })
    };

    if (group.color) entry.color = group.color;
    const cleanup: Record<string, unknown> = {};
    if (group.ttlMinutes != null && Number.isFinite(group.ttlMinutes) && group.ttlMinutes > 0) {
      cleanup.ttlMinutes = Math.floor(group.ttlMinutes);
    }
    if (group.maxTabs != null && Number.isFinite(group.maxTabs) && group.maxTabs > 0) {
      cleanup.maxTabs = Math.floor(group.maxTabs);
    }
    if (group.lru === true) cleanup.lru = true;
    if (Object.keys(cleanup).length > 0) entry.cleanup = cleanup;
    return entry;
  });

  const yaml = stringifyYaml(nextConfig, { lineWidth: 0 });
  return {
    yaml: yaml.endsWith('\n') ? yaml : `${yaml}\n`,
    rawConfig: nextConfig
  };
}
