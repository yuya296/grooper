import { z } from 'zod';
import { parse } from 'yaml';
import type { ApplyMode, CompiledConfig, CompiledRule, Config, MatchMode } from './types.js';
import { validateGroupTemplateForMatchMode } from './rule-template.js';

export interface ConfigError {
  path: string;
  message: string;
}

const ruleSchema = z
  .object({
    pattern: z.string().min(1),
    group: z.string().min(1),
    matchMode: z.enum(['regex', 'glob']).optional(),
    color: z.string().optional(),
    priority: z.number().int().optional()
  })
  .strict();

const configSchema = z
  .object({
    version: z.literal(1),
    applyMode: z.enum(['manual', 'newTabs', 'always']).optional(),
    vars: z.record(z.string()).optional(),
    fallbackGroup: z.string().optional(),
    parentFollow: z.boolean().optional(),
    groups: z
      .record(
        z
          .object({
            color: z.string().optional(),
            ttlMinutes: z.number().positive().optional(),
            maxTabs: z.number().int().positive().optional(),
            lru: z.boolean().optional()
          })
          .strict()
      )
      .optional(),
    shortcuts: z
      .object({
        slots: z.array(z.string().min(1)).optional()
      })
      .strict()
      .optional(),
    rules: z.array(ruleSchema)
  })
  .strict();

const DEFAULT_APPLY_MODE: ApplyMode = 'manual';

function globToRegexPattern(glob: string): string {
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

export function parseConfigYaml(yamlText: string): { config?: CompiledConfig; errors: ConfigError[] } {
  let raw: unknown;
  try {
    raw = parse(yamlText);
  } catch (err) {
    return {
      errors: [
        {
          path: 'yaml',
          message: err instanceof Error ? err.message : 'YAML parse error'
        }
      ]
    };
  }

  const result = configSchema.safeParse(raw);
  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      path: issue.path.join('.') || 'config',
      message: issue.message
    }));
    return { errors };
  }

  const config: Config = result.data;
  const errors: ConfigError[] = [];
  const vars = config.vars ?? {};

  const expandVars = (template: string, path: string) => {
    return template.replace(/\$\{([A-Za-z0-9_]+)\}/g, (match, name: string) => {
      const value = vars[name];
      if (value === undefined) {
        errors.push({ path, message: `Unknown variable: ${name}` });
        return match;
      }
      return value;
    });
  };

  const rules: CompiledRule[] = config.rules.map((rule, index) => {
    const matchMode: MatchMode = rule.matchMode ?? 'regex';
    try {
      const pattern = expandVars(rule.pattern, `rules.${index}.pattern`);
      const group = expandVars(rule.group, `rules.${index}.group`);
      const groupTemplateError = validateGroupTemplateForMatchMode(group, matchMode);
      if (groupTemplateError) {
        errors.push({
          path: `rules.${index}.group`,
          message: groupTemplateError
        });
      }
      const regex = new RegExp(matchMode === 'glob' ? globToRegexPattern(pattern) : pattern);
      return { ...rule, pattern, group, matchMode, regex, index, priority: rule.priority ?? 0 };
    } catch (err) {
      errors.push({
        path: `rules.${index}.pattern`,
        message: err instanceof Error ? err.message : 'Invalid regex'
      });
      return { ...rule, matchMode, regex: /.^/, index, priority: rule.priority ?? 0 };
    }
  });

  if (errors.length > 0) {
    return { errors };
  }

  const sortedRules = [...rules].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.index - b.index;
  });

  const normalizedFallback = (() => {
    if (config.fallbackGroup == null) return undefined;
    const trimmed = config.fallbackGroup.trim();
    if (trimmed.length === 0) return undefined;
    if (trimmed.toLowerCase() === 'none') return undefined;
    return trimmed;
  })();

  return {
    config: {
      version: 1,
      applyMode: config.applyMode ?? DEFAULT_APPLY_MODE,
      vars,
      fallbackGroup: normalizedFallback,
      parentFollow: config.parentFollow ?? true,
      groups: config.groups ?? {},
      shortcuts: config.shortcuts,
      rules: sortedRules
    },
    errors: []
  };
}
