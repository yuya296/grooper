import { z } from 'zod';
import { parse } from 'yaml';
import type {
  ApplyMode,
  CompiledConfig,
  CompiledGroup,
  CompiledRule,
  Config,
  GroupCleanup,
  GroupingStrategy,
  MatchMode
} from './types.js';
import { compileRulePattern } from './rule-template.js';

export interface ConfigError {
  path: string;
  message: string;
}

const ruleSchema = z
  .object({
    pattern: z.string().min(1),
    matchMode: z.enum(['regex', 'glob']).optional()
  })
  .strict();

const groupSchema = z
  .object({
    name: z.string().min(1),
    color: z.string().optional(),
    cleanup: z
      .object({
        ttlMinutes: z.number().positive().optional(),
        maxTabs: z.number().int().positive().optional(),
        lru: z.boolean().optional()
      })
      .strict()
      .optional(),
    rules: z.array(ruleSchema)
  })
  .strict();

const configSchema = z
  .object({
    version: z.literal(2),
    applyMode: z.enum(['manual', 'newTabs', 'always']).optional(),
    vars: z.record(z.string()).optional(),
    groupingStrategy: z.enum(['inheritFirst', 'ruleFirst', 'ruleOnly']).optional(),
    shortcuts: z
      .object({
        slots: z.array(z.string().min(1)).optional()
      })
      .strict()
      .optional(),
    groups: z.array(groupSchema)
  })
  .strict();

const DEFAULT_APPLY_MODE: ApplyMode = 'manual';
const DEFAULT_GROUPING_STRATEGY: GroupingStrategy = 'inheritFirst';
const DEFAULT_MATCH_MODE: MatchMode = 'glob';

function normalizeCleanup(cleanup: Config['groups'][number]['cleanup']): GroupCleanup {
  if (!cleanup) return {};
  return {
    ttlMinutes: cleanup.ttlMinutes,
    maxTabs: cleanup.maxTabs,
    lru: cleanup.lru
  };
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

  const groups: CompiledGroup[] = [];
  const groupsByName: Record<string, CompiledGroup> = {};
  const rules: CompiledRule[] = [];
  let ruleIndex = 0;

  for (let groupIndex = 0; groupIndex < config.groups.length; groupIndex += 1) {
    const group = config.groups[groupIndex];
    const name = group.name.trim();
    if (!name) {
      errors.push({ path: `groups.${groupIndex}.name`, message: 'Group name must not be empty' });
      continue;
    }
    if (groupsByName[name]) {
      errors.push({ path: `groups.${groupIndex}.name`, message: `Duplicate group name: ${name}` });
      continue;
    }

    const compiledGroupRules: CompiledRule[] = [];
    for (let i = 0; i < group.rules.length; i += 1) {
      const rule = group.rules[i];
      const matchMode: MatchMode = rule.matchMode ?? DEFAULT_MATCH_MODE;
      const pattern = expandVars(rule.pattern, `groups.${groupIndex}.rules.${i}.pattern`);
      try {
        const regex = compileRulePattern(pattern, matchMode);
        const compiledRule: CompiledRule = {
          pattern,
          matchMode,
          regex,
          index: ruleIndex,
          groupName: name,
          groupColor: group.color
        };
        compiledGroupRules.push(compiledRule);
        rules.push(compiledRule);
      } catch (err) {
        errors.push({
          path: `groups.${groupIndex}.rules.${i}.pattern`,
          message: err instanceof Error ? err.message : 'Invalid regex'
        });
      } finally {
        ruleIndex += 1;
      }
    }

    const compiledGroup: CompiledGroup = {
      name,
      color: group.color,
      cleanup: normalizeCleanup(group.cleanup),
      rules: compiledGroupRules
    };
    groups.push(compiledGroup);
    groupsByName[name] = compiledGroup;
  }

  if (errors.length > 0) {
    return { errors };
  }

  return {
    config: {
      version: 2,
      applyMode: config.applyMode ?? DEFAULT_APPLY_MODE,
      vars,
      groupingStrategy: config.groupingStrategy ?? DEFAULT_GROUPING_STRATEGY,
      shortcuts: config.shortcuts,
      groups,
      groupsByName,
      rules
    },
    errors: []
  };
}
