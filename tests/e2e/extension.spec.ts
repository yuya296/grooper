import { test, expect, chromium } from '@playwright/test';
import path from 'node:path';
import { readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.resolve(__dirname, '../../dist/extension');

async function launchExtension(testInfo: { outputPath: (name?: string) => string }) {
  const userDataDir = testInfo.outputPath('user-data');
  const headless = process.env.PW_HEADLESS === '1';
  const executablePath = await resolveChromiumExecutable();
  const launchOptions: Parameters<typeof chromium.launchPersistentContext>[1] = {
    headless,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      '--enable-extensions',
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  };
  if (executablePath) {
    launchOptions.executablePath = executablePath;
  } else if (process.platform === 'darwin') {
    launchOptions.channel = 'chrome';
  }
  const context = await chromium.launchPersistentContext(userDataDir, launchOptions);

  const worker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  return { context, worker };
}

async function resolveChromiumExecutable() {
  if (process.platform !== 'darwin') return undefined;
  const home = process.env.HOME;
  if (!home) return undefined;
  const base = path.join(home, 'Library', 'Caches', 'ms-playwright');
  try {
    const entries = await readdir(base, { withFileTypes: true });
    const candidates = entries
      .filter((entry) => entry.isDirectory() && entry.name.startsWith('chromium-'))
      .map((entry) => entry.name)
      .sort((a, b) => b.localeCompare(a));
    for (const candidate of candidates) {
      const armPath = path.join(base, candidate, 'chrome-mac-arm64', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
      if (existsSync(armPath)) return armPath;
      const x64Path = path.join(base, candidate, 'chrome-mac-x64', 'Chromium.app', 'Contents', 'MacOS', 'Chromium');
      if (existsSync(x64Path)) return x64Path;
    }
  } catch {
    return undefined;
  }
  return undefined;
}

async function diag<T>(worker: import('@playwright/test').Worker, request: any): Promise<T> {
  return await worker.evaluate(async (payload) => {
    return await chrome.runtime.sendMessage({ __diag__: payload });
  }, request);
}

async function setConfig(worker: import('@playwright/test').Worker, yaml: string) {
  const response = await diag<{ ok: boolean; error?: string }>(worker, { command: 'setConfig', payload: { yaml } });
  if (!response.ok) throw new Error(response.error ?? 'setConfig failed');
}

test('pattern match and fallback', async ({}, testInfo) => {
  const { context, worker } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: manual\nparentFollow: true\nfallbackGroup: "Fallback"\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n`;
  await setConfig(worker, yaml);

  const tab1 = await context.newPage();
  await tab1.goto('https://example.com');
  const tab2 = await context.newPage();
  await tab2.goto('https://example.org');

  await diag(worker, { command: 'runOnce', payload: { dryRun: false } });
  const state = await diag<any>(worker, { command: 'getState' });
  const exampleTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.com'));
  const fallbackTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.org'));
  const exampleGroup = state.state.groups.find((g: any) => g.id === exampleTab.groupId);
  const fallbackGroup = state.state.groups.find((g: any) => g.id === fallbackTab.groupId);
  expect(exampleGroup?.title).toBe('Example');
  expect(fallbackGroup?.title).toBe('Fallback');

  await context.close();
});

test('parent follow', async ({}, testInfo) => {
  const { context, worker } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: manual\nparentFollow: true\nfallbackGroup: "Fallback"\nrules:\n  - pattern: 'example\\.com/parent'\n    group: "ParentGroup"\n`;
  await setConfig(worker, yaml);

  const parent = await context.newPage();
  await parent.goto('https://example.com/parent');
  await diag(worker, { command: 'runOnce', payload: { dryRun: false } });

  await parent.evaluate(() => window.open('https://child.com', '_blank'));
  await diag(worker, { command: 'runOnce', payload: { dryRun: false } });
  const state = await diag<any>(worker, { command: 'getState' });
  const child = state.state.tabs.find((tab: any) => tab.url?.includes('child.com'));
  const childGroup = state.state.groups.find((g: any) => g.id === child.groupId);
  expect(childGroup?.title).toBe('ParentGroup');

  await context.close();
});

test('apply modes', async ({}, testInfo) => {
  const { context, worker } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: newTabs\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n`;
  await setConfig(worker, yaml);

  const tab = await context.newPage();
  await tab.goto('https://example.com');

  await new Promise((resolve) => setTimeout(resolve, 500));
  let state = await diag<any>(worker, { command: 'getState' });
  let exampleGrouped = state.state.tabs.some((t: any) => t.url?.includes('example.com') && state.state.groups.find((g: any) => g.id === t.groupId)?.title === 'Example');
  expect(exampleGrouped).toBe(true);

  const yamlAlways = `version: 1\napplyMode: always\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n`;
  await setConfig(worker, yamlAlways);

  const tab2 = await context.newPage();
  await tab2.goto('https://example.org');
  await tab2.goto('https://example.com');

  await new Promise((resolve) => setTimeout(resolve, 500));
  state = await diag<any>(worker, { command: 'getState' });
  exampleGrouped = state.state.tabs.some((t: any) => t.url?.includes('example.com') && state.state.groups.find((g: any) => g.id === t.groupId)?.title === 'Example');
  expect(exampleGrouped).toBe(true);

  await context.close();
});

test('auto cleanup TTL and maxTabs', async ({}, testInfo) => {
  const { context, worker } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: manual\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n    color: "blue"\ngroups:\n  Example:\n    ttlMinutes: 1\n    maxTabs: 1\n    lru: true\n`;
  await setConfig(worker, yaml);

  const tab1 = await context.newPage();
  await tab1.goto('https://example.com/old');
  const tab2 = await context.newPage();
  await tab2.goto('https://example.com/new');

  await diag(worker, { command: 'runOnce', payload: { dryRun: false } });
  let state = await diag<any>(worker, { command: 'getState' });
  const oldTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.com/old'));
  const newTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.com/new'));

  const now = Date.now();
  await worker.evaluate(
    ({ oldId, newId, nowValue }) => {
      const map: Record<string, number> = {};
      map[String(oldId)] = nowValue - 2 * 60 * 1000;
      map[String(newId)] = nowValue;
      return chrome.storage.local.set({ lastActiveAt: map });
    },
    { oldId: oldTab.id, newId: newTab.id, nowValue: now }
  );

  await diag(worker, { command: 'runOnce', payload: { dryRun: false } });
  state = await diag<any>(worker, { command: 'getState' });
  const remaining = state.state.tabs.filter((tab: any) => tab.url?.includes('example.com'));
  expect(remaining.length).toBe(1);

  await context.close();
});
