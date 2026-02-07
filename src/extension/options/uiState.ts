import { parse as parseYaml, stringify as stringifyYaml } from 'yaml';
import { parseConfigYaml } from '../../core/config.js';

export interface RuleForm {
  pattern: string;
  group: string;
  color?: string;
  priority?: number;
}

export interface UiState {
  applyMode: 'manual' | 'newTabs' | 'always';
  fallbackGroup?: string;
  rules: RuleForm[];
}

export type UiParseResult =
  | { ok: true; uiState: UiState; rawConfig: Record<string, unknown> }
  | { ok: false; errors: string[] };

function normalizeRule(rule: any): RuleForm {
  return {
    pattern: String(rule?.pattern ?? ''),
    group: String(rule?.group ?? ''),
    color: rule?.color ? String(rule.color) : undefined,
    priority: rule?.priority != null ? Number(rule.priority) : undefined
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

  return { ok: true, uiState: { applyMode, fallbackGroup, rules }, rawConfig };
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
    if (rule.color) entry.color = rule.color;
    if (rule.priority != null && !Number.isNaN(rule.priority)) entry.priority = rule.priority;
    return entry;
  });

  const next = stringifyYaml(nextConfig, { lineWidth: 0 });
  return {
    yaml: next.endsWith('\n') ? next : `${next}\n`,
    rawConfig: nextConfig
  };
}
