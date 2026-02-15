import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { parseConfigYaml } from '../../core/config.js';
import type { MatchMode } from '../../core/types.js';

export interface RuleForm {
  pattern: string;
  group: string;
  matchMode: MatchMode;
  color?: string;
  priority?: number;
}

export interface GroupPolicyForm {
  name: string;
  color?: string;
  ttlMinutes?: number;
  maxTabs?: number;
  lru?: boolean;
}

export interface UiState {
  applyMode: 'manual' | 'newTabs' | 'always';
  fallbackGroup?: string;
  rules: RuleForm[];
  groups: GroupPolicyForm[];
}

export type UiParseResult =
  | { ok: true; uiState: UiState; rawConfig: Record<string, unknown> }
  | { ok: false; errors: string[] };

function normalizeRule(rule: any): RuleForm {
  return {
    pattern: String(rule?.pattern ?? ''),
    group: String(rule?.group ?? ''),
    matchMode: rule?.matchMode === 'glob' ? 'glob' : 'regex',
    color: rule?.color ? String(rule.color) : undefined,
    priority: rule?.priority != null ? Number(rule.priority) : undefined
  };
}

function normalizePositiveNumber(value: unknown): number | undefined {
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return undefined;
  return num;
}

function normalizeGroupPolicy(name: string, policy: any): GroupPolicyForm {
  return {
    name,
    color: typeof policy?.color === 'string' && policy.color.length > 0 ? policy.color : undefined,
    ttlMinutes: normalizePositiveNumber(policy?.ttlMinutes),
    maxTabs: normalizePositiveNumber(policy?.maxTabs),
    lru: policy?.lru === true ? true : undefined
  };
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
  if (validation.errors.length > 0) {
    return {
      ok: false,
      errors: validation.errors.map((e) => `${e.path}: ${e.message}`)
    };
  }

  if (raw == null || typeof raw !== 'object') {
    return { ok: false, errors: ['config: invalid structure'] };
  }

  const rawConfig = raw as Record<string, unknown>;
  const applyMode = (rawConfig.applyMode as UiState['applyMode']) ?? 'manual';
  const fallbackGroup = (() => {
    const value = typeof rawConfig.fallbackGroup === 'string' ? rawConfig.fallbackGroup.trim() : '';
    if (!value) return undefined;
    if (value.toLowerCase() === 'none') return undefined;
    return value;
  })();
  const rules = Array.isArray(rawConfig.rules) ? rawConfig.rules.map(normalizeRule) : [];
  const groups = (() => {
    if (!rawConfig.groups || typeof rawConfig.groups !== 'object') return [];
    return Object.entries(rawConfig.groups as Record<string, unknown>)
      .map(([name, policy]) => normalizeGroupPolicy(name, policy))
      .sort((a, b) => a.name.localeCompare(b.name));
  })();

  return { ok: true, uiState: { applyMode, fallbackGroup, rules, groups }, rawConfig };
}

export function buildYamlFromUi(
  rawConfig: Record<string, unknown> | null,
  uiState: UiState
): { yaml: string; rawConfig: Record<string, unknown> } {
  const nextConfig: Record<string, unknown> =
    rawConfig && typeof rawConfig === 'object' ? { ...rawConfig } : { version: 1 };

  nextConfig.version = 1;
  nextConfig.applyMode = uiState.applyMode;
  if (uiState.fallbackGroup && uiState.fallbackGroup.trim().length > 0) {
    nextConfig.fallbackGroup = uiState.fallbackGroup.trim();
  } else {
    delete nextConfig.fallbackGroup;
  }
  nextConfig.rules = uiState.rules.map((rule) => {
    const entry: Record<string, unknown> = {
      pattern: rule.pattern,
      group: rule.group
    };
    if (rule.matchMode === 'glob') entry.matchMode = 'glob';
    if (rule.color) entry.color = rule.color;
    if (rule.priority != null && !Number.isNaN(rule.priority)) entry.priority = rule.priority;
    return entry;
  });
  const nextGroups: Record<string, Record<string, unknown>> = {};
  for (const group of uiState.groups) {
    const name = group.name.trim();
    if (!name) continue;
    const policy: Record<string, unknown> = {};
    if (group.color) policy.color = group.color;
    if (group.ttlMinutes != null && Number.isFinite(group.ttlMinutes) && group.ttlMinutes > 0) {
      policy.ttlMinutes = Math.floor(group.ttlMinutes);
    }
    if (group.maxTabs != null && Number.isFinite(group.maxTabs) && group.maxTabs > 0) {
      policy.maxTabs = Math.floor(group.maxTabs);
    }
    if (group.lru === true) policy.lru = true;
    nextGroups[name] = policy;
  }
  if (Object.keys(nextGroups).length > 0) {
    nextConfig.groups = nextGroups;
  } else {
    delete nextConfig.groups;
  }

  const next = stringifyYaml(nextConfig, { lineWidth: 0 });
  return {
    yaml: next.endsWith('\n') ? next : `${next}\n`,
    rawConfig: nextConfig
  };
}
