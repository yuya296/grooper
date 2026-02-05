import { Command } from 'commander';
import { readFile, writeFile } from 'node:fs/promises';
import { parseConfigYaml } from '../core/config.js';
import { createPlan } from '../core/planner.js';
import type { Plan, StateSnapshot } from '../core/types.js';

async function loadYaml(path: string) {
  return await readFile(path, 'utf8');
}

async function loadState(path: string): Promise<StateSnapshot> {
  const raw = await readFile(path, 'utf8');
  return JSON.parse(raw) as StateSnapshot;
}

async function writeOutput(path: string | undefined, value: unknown) {
  const text = JSON.stringify(value, null, 2);
  if (path) {
    await writeFile(path, text);
    return;
  }
  process.stdout.write(`${text}\n`);
}

function ensureConfig(yaml: string) {
  const { config, errors } = parseConfigYaml(yaml);
  if (!config) {
    const message = errors.map((e) => `${e.path}: ${e.message}`).join('\n');
    throw new Error(message);
  }
  return config;
}

function applyPlan(state: StateSnapshot, plan: Plan): StateSnapshot {
  const next: StateSnapshot = {
    tabs: state.tabs.map((tab) => ({ ...tab })),
    groups: state.groups.map((group) => ({ ...group }))
  };

  const nextGroupId = () => {
    const currentMax = next.groups.reduce((max, group) => Math.max(max, group.id), 0);
    return currentMax + 1;
  };

  const findGroup = (windowId: number, title: string) =>
    next.groups.find((group) => group.windowId === windowId && group.title === title);

  for (const action of plan.actions) {
    if (action.type === 'ensureGroup') {
      let group = findGroup(action.windowId, action.group);
      if (!group) {
        group = { id: nextGroupId(), title: action.group, color: action.color, windowId: action.windowId };
        next.groups.push(group);
      } else if (action.color) {
        group.color = action.color;
      }
    }

    if (action.type === 'moveTab') {
      let group = findGroup(action.windowId, action.group);
      if (!group) {
        group = { id: nextGroupId(), title: action.group, color: undefined, windowId: action.windowId };
        next.groups.push(group);
      }
      const tab = next.tabs.find((t) => t.id === action.tabId);
      if (tab) tab.groupId = group.id;
    }

    if (action.type === 'closeTab') {
      next.tabs = next.tabs.filter((tab) => tab.id !== action.tabId);
    }
  }

  return next;
}

const program = new Command();
program.name('tabgrouper');

program
  .command('plan')
  .requiredOption('--config <path>')
  .requiredOption('--state <path>')
  .option('--out <path>')
  .action(async (options) => {
    try {
      const yaml = await loadYaml(options.config);
      const config = ensureConfig(yaml);
      const state = await loadState(options.state);
      const plan = createPlan(state, config, { includeCleanup: true });
      await writeOutput(options.out, plan);
    } catch (err) {
      console.error(String(err));
      process.exit(1);
    }
  });

program
  .command('apply')
  .requiredOption('--config <path>')
  .requiredOption('--state <path>')
  .option('--out <path>')
  .action(async (options) => {
    try {
      const yaml = await loadYaml(options.config);
      const config = ensureConfig(yaml);
      const state = await loadState(options.state);
      const plan = createPlan(state, config, { includeCleanup: true });
      const nextState = applyPlan(state, plan);
      await writeOutput(options.out, nextState);
    } catch (err) {
      console.error(String(err));
      process.exit(1);
    }
  });

program
  .command('snapshot')
  .requiredOption('--state <path>')
  .option('--out <path>')
  .action(async (options) => {
    try {
      const state = await loadState(options.state);
      await writeOutput(options.out, state);
    } catch (err) {
      console.error(String(err));
      process.exit(1);
    }
  });

program
  .command('verify')
  .requiredOption('--config <path>')
  .requiredOption('--state <path>')
  .requiredOption('--expected <path>')
  .action(async (options) => {
    try {
      const yaml = await loadYaml(options.config);
      const config = ensureConfig(yaml);
      const state = await loadState(options.state);
      const plan = createPlan(state, config, { includeCleanup: true });
      const expectedRaw = await readFile(options.expected, 'utf8');
      const expected = JSON.parse(expectedRaw) as Plan;
      const actualText = JSON.stringify(plan, null, 2);
      const expectedText = JSON.stringify(expected, null, 2);
      if (actualText !== expectedText) {
        console.error('plan mismatch');
        process.exit(1);
      }
      process.stdout.write('ok\n');
    } catch (err) {
      console.error(String(err));
      process.exit(1);
    }
  });

program.parseAsync(process.argv);
