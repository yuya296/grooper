const CONFIG_KEY = 'configYaml';
const LOGS_KEY = 'logs';
const LAST_ACTIVE_KEY = 'lastActiveAt';

export const DEFAULT_CONFIG_YAML = `version: 1
applyMode: newTabs
parentFollow: false
shortcuts:
  slots:
    - "Work"
    - "Search"
    - "Personal"
rules:
  # 開発・業務系
  - pattern: '*github.com*'
    matchMode: glob
    group: 'Work'
    color: 'blue'
    priority: 100
  - pattern: '*gitlab.com*'
    matchMode: glob
    group: 'Work'
    color: 'blue'
    priority: 100
  - pattern: '*bitbucket.org*'
    matchMode: glob
    group: 'Work'
    color: 'blue'
    priority: 100
  - pattern: '*atlassian.net*'
    matchMode: glob
    group: 'Work'
    color: 'blue'
    priority: 95
  - pattern: '*linear.app*'
    matchMode: glob
    group: 'Work'
    color: 'blue'
    priority: 95
  # ドキュメント・ナレッジ
  - pattern: '*docs.google.com*'
    matchMode: glob
    group: 'Docs'
    color: 'green'
    priority: 90
  - pattern: '*notion.so*'
    matchMode: glob
    group: 'Docs'
    color: 'green'
    priority: 90
  - pattern: '*qiita.com*'
    matchMode: glob
    group: 'Docs'
    color: 'green'
    priority: 85
  - pattern: '*zenn.dev*'
    matchMode: glob
    group: 'Docs'
    color: 'green'
    priority: 85
  # 検索
  - pattern: '*google.*/search*'
    matchMode: glob
    group: 'Search'
    color: 'red'
    priority: 80
  - pattern: '*bing.com/search*'
    matchMode: glob
    group: 'Search'
    color: 'red'
    priority: 80
  - pattern: '*duckduckgo.com/*'
    matchMode: glob
    group: 'Search'
    color: 'red'
    priority: 80
  # メディア
  - pattern: '*youtube.com*'
    matchMode: glob
    group: 'Media'
    color: 'purple'
    priority: 70
  - pattern: '*netflix.com*'
    matchMode: glob
    group: 'Media'
    color: 'purple'
    priority: 70
  # SNS
  - pattern: '*x.com*'
    matchMode: glob
    group: 'Social'
    color: 'orange'
    priority: 60
  - pattern: '*twitter.com*'
    matchMode: glob
    group: 'Social'
    color: 'orange'
    priority: 60
`;

export async function getConfigYaml(): Promise<string> {
  const result = await chrome.storage.local.get(CONFIG_KEY);
  return (result[CONFIG_KEY] as string) ?? DEFAULT_CONFIG_YAML;
}

export async function setConfigYaml(yaml: string): Promise<void> {
  await chrome.storage.local.set({ [CONFIG_KEY]: yaml });
}

export async function appendLog(message: string): Promise<void> {
  const result = await chrome.storage.local.get(LOGS_KEY);
  const logs = (result[LOGS_KEY] as string[]) ?? [];
  const next = [...logs, `${new Date().toISOString()} ${message}`].slice(-200);
  await chrome.storage.local.set({ [LOGS_KEY]: next });
}

export async function getLogs(): Promise<string[]> {
  const result = await chrome.storage.local.get(LOGS_KEY);
  return (result[LOGS_KEY] as string[]) ?? [];
}

export async function getLastActiveMap(): Promise<Record<string, number>> {
  const result = await chrome.storage.local.get(LAST_ACTIVE_KEY);
  return (result[LAST_ACTIVE_KEY] as Record<string, number>) ?? {};
}

export async function setLastActiveAt(tabId: number, timestamp: number): Promise<void> {
  const map = await getLastActiveMap();
  map[String(tabId)] = timestamp;
  await chrome.storage.local.set({ [LAST_ACTIVE_KEY]: map });
}

export async function removeLastActive(tabId: number): Promise<void> {
  const map = await getLastActiveMap();
  delete map[String(tabId)];
  await chrome.storage.local.set({ [LAST_ACTIVE_KEY]: map });
}
