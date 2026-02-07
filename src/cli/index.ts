import { Command } from 'commander';
import { readFile, writeFile } from 'node:fs/promises';
import { createPlan } from '../core/planner.js';
import type { Plan, StateSnapshot } from '../core/types.js';
import { applyPlan, ensureConfig } from './lib.js';

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
