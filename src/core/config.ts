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
    color: z.string().optional()
  })
  .strict();

const configSchema = z
  .object({
    version: z.literal(1),
    applyMode: z.enum(['manual', 'newTabs', 'always']).optional(),
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

  const rules: CompiledRule[] = config.rules.map((rule, index) => {
    try {
      const regex = new RegExp(rule.pattern);
      return { ...rule, regex, index };
    } catch (err) {
      errors.push({
        path: `rules.${index}.pattern`,
        message: err instanceof Error ? err.message : 'Invalid regex'
      });
      return { ...rule, regex: /.^/, index };
    }
  });

  if (errors.length > 0) {
    return { errors };
  }

  return {
    config: {
      version: 1,
      applyMode: config.applyMode ?? DEFAULT_APPLY_MODE,
      rules
    },
    errors: []
  };
}
