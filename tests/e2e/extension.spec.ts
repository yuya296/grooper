import { test, expect, chromium } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const extensionPath = path.resolve(__dirname, '../../dist/extension');

async function launchExtension(testInfo: { outputPath: (name?: string) => string }) {
  const userDataDir = testInfo.outputPath('user-data');
  const headless = process.env.PW_HEADLESS === '1';
  const launchOptions: Parameters<typeof chromium.launchPersistentContext>[1] = {
    headless,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [
      `--disable-extensions-except=${extensionPath}`,
      `--load-extension=${extensionPath}`
    ]
  };
  if (process.platform === 'darwin') {
    launchOptions.channel = 'chrome';
  }
  const context = await chromium.launchPersistentContext(userDataDir, launchOptions);

  const serviceWorker = context.serviceWorkers()[0] ?? (await context.waitForEvent('serviceworker'));
  const extensionId = new URL(serviceWorker.url()).host;
  const page = await context.newPage();
  await page.goto(`chrome-extension://${extensionId}/options.html`);

  return { context, page, extensionId };
}

async function diag<T>(page: import('@playwright/test').Page, request: any): Promise<T> {
  return await page.evaluate(async (payload) => {
    return await chrome.runtime.sendMessage({ __diag__: payload });
  }, request);
}

async function setConfig(page: import('@playwright/test').Page, yaml: string) {
  const response = await diag<{ ok: boolean; error?: string }>(page, { command: 'setConfig', payload: { yaml } });
  if (!response.ok) throw new Error(response.error ?? 'setConfig failed');
}

test('pattern match and fallback', async ({}, testInfo) => {
  const { context, page } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: manual\nparentFollow: true\nfallbackGroup: "Fallback"\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n`;
  await setConfig(page, yaml);

  const tab1 = await context.newPage();
  await tab1.goto('https://example.com');
  const tab2 = await context.newPage();
  await tab2.goto('https://example.org');

  await diag(page, { command: 'runOnce', payload: { dryRun: false } });
  const state = await diag<any>(page, { command: 'getState' });
  const exampleTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.com'));
  const fallbackTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.org'));
  const exampleGroup = state.state.groups.find((g: any) => g.id === exampleTab.groupId);
  const fallbackGroup = state.state.groups.find((g: any) => g.id === fallbackTab.groupId);
  expect(exampleGroup?.title).toBe('Example');
  expect(fallbackGroup?.title).toBe('Fallback');

  await context.close();
});

test('parent follow', async ({}, testInfo) => {
  const { context, page } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: manual\nparentFollow: true\nfallbackGroup: "Fallback"\nrules:\n  - pattern: 'example\\.com/parent'\n    group: "ParentGroup"\n`;
  await setConfig(page, yaml);

  const parent = await context.newPage();
  await parent.goto('https://example.com/parent');
  await diag(page, { command: 'runOnce', payload: { dryRun: false } });

  await parent.evaluate(() => window.open('https://child.com', '_blank'));
  await diag(page, { command: 'runOnce', payload: { dryRun: false } });
  const state = await diag<any>(page, { command: 'getState' });
  const child = state.state.tabs.find((tab: any) => tab.url?.includes('child.com'));
  const childGroup = state.state.groups.find((g: any) => g.id === child.groupId);
  expect(childGroup?.title).toBe('ParentGroup');

  await context.close();
});

test('apply modes', async ({}, testInfo) => {
  const { context, page } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: newTabs\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n`;
  await setConfig(page, yaml);

  const tab = await context.newPage();
  await tab.goto('https://example.com');

  await page.waitForTimeout(500);
  let state = await diag<any>(page, { command: 'getState' });
  let exampleGrouped = state.state.tabs.some((t: any) => t.url?.includes('example.com') && state.state.groups.find((g: any) => g.id === t.groupId)?.title === 'Example');
  expect(exampleGrouped).toBe(true);

  const yamlAlways = `version: 1\napplyMode: always\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n`;
  await setConfig(page, yamlAlways);

  const tab2 = await context.newPage();
  await tab2.goto('https://example.org');
  await tab2.goto('https://example.com');

  await page.waitForTimeout(500);
  state = await diag<any>(page, { command: 'getState' });
  exampleGrouped = state.state.tabs.some((t: any) => t.url?.includes('example.com') && state.state.groups.find((g: any) => g.id === t.groupId)?.title === 'Example');
  expect(exampleGrouped).toBe(true);

  await context.close();
});

test('auto cleanup TTL and maxTabs', async ({}, testInfo) => {
  const { context, page } = await launchExtension(testInfo);
  const yaml = `version: 1\napplyMode: manual\nrules:\n  - pattern: 'example\\.com'\n    group: "Example"\n    color: "blue"\ngroups:\n  Example:\n    ttlMinutes: 1\n    maxTabs: 1\n    lru: true\n`;
  await setConfig(page, yaml);

  const tab1 = await context.newPage();
  await tab1.goto('https://example.com/old');
  const tab2 = await context.newPage();
  await tab2.goto('https://example.com/new');

  await diag(page, { command: 'runOnce', payload: { dryRun: false } });
  let state = await diag<any>(page, { command: 'getState' });
  const oldTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.com/old'));
  const newTab = state.state.tabs.find((tab: any) => tab.url?.includes('example.com/new'));

  const now = Date.now();
  await page.evaluate(
    ({ oldId, newId, nowValue }) => {
      const map: Record<string, number> = {};
      map[String(oldId)] = nowValue - 2 * 60 * 1000;
      map[String(newId)] = nowValue;
      return chrome.storage.local.set({ lastActiveAt: map });
    },
    { oldId: oldTab.id, newId: newTab.id, nowValue: now }
  );

  await diag(page, { command: 'runOnce', payload: { dryRun: false } });
  state = await diag<any>(page, { command: 'getState' });
  const remaining = state.state.tabs.filter((tab: any) => tab.url?.includes('example.com'));
  expect(remaining.length).toBe(1);

  await context.close();
});
