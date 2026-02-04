const CONFIG_KEY = 'configYaml';
const LOGS_KEY = 'logs';

export const DEFAULT_CONFIG_YAML = `version: 1
applyMode: manual
rules:
  - pattern: "example\\.com"
    group: "Example"
    color: "blue"
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
