import { z } from 'zod';
import { parse } from 'yaml';
import type { ApplyMode, CompiledConfig, CompiledRule, Config } from './types.js';

export interface ConfigError {
  path: string;
  message: string;
}

const ruleSchema = z
  .object({
    pattern: z.string().min(1),
    group: z.string().min(1),
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
    try {
      const pattern = expandVars(rule.pattern, `rules.${index}.pattern`);
      const group = expandVars(rule.group, `rules.${index}.group`);
      const regex = new RegExp(pattern);
      return { ...rule, pattern, group, regex, index, priority: rule.priority ?? 0 };
    } catch (err) {
      errors.push({
        path: `rules.${index}.pattern`,
        message: err instanceof Error ? err.message : 'Invalid regex'
      });
      return { ...rule, regex: /.^/, index, priority: rule.priority ?? 0 };
    }
  });

  if (errors.length > 0) {
    return { errors };
  }

  const sortedRules = [...rules].sort((a, b) => {
    if (b.priority !== a.priority) return b.priority - a.priority;
    return a.index - b.index;
  });

  return {
    config: {
      version: 1,
      applyMode: config.applyMode ?? DEFAULT_APPLY_MODE,
      vars,
      fallbackGroup: config.fallbackGroup,
      parentFollow: config.parentFollow ?? true,
      groups: config.groups ?? {},
      shortcuts: config.shortcuts,
      rules: sortedRules
    },
    errors: []
  };
}
