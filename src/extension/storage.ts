const CONFIG_KEY = 'configYaml';
const LOGS_KEY = 'logs';
const LAST_ACTIVE_KEY = 'lastActiveAt';

export const DEFAULT_CONFIG_YAML = `version: 1
applyMode: manual
rules:
  - pattern: 'example\\.com'
    group: 'Example'
    color: 'blue'
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
