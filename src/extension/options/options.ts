import { parseConfigYaml } from '../../core/config.js';

const yamlArea = document.getElementById('yaml') as HTMLTextAreaElement;
const errors = document.getElementById('errors') as HTMLDivElement;
const previewOutput = document.getElementById('previewOutput') as HTMLDivElement;
const history = document.getElementById('history') as HTMLDivElement;

const validateButton = document.getElementById('validate') as HTMLButtonElement;
const saveButton = document.getElementById('save') as HTMLButtonElement;
const exportButton = document.getElementById('export') as HTMLButtonElement;
const importButton = document.getElementById('import') as HTMLButtonElement;
const previewButton = document.getElementById('preview') as HTMLButtonElement;
const rollbackButton = document.getElementById('rollback') as HTMLButtonElement;

function renderErrors(messages: string[]) {
  errors.textContent = messages.length === 0 ? '' : messages.join('\n');
}

function validateYaml() {
  const result = parseConfigYaml(yamlArea.value);
  if (result.errors.length > 0) {
    renderErrors(result.errors.map((e) => `${e.path}: ${e.message}`));
    return false;
  }
  renderErrors(['OK']);
  return true;
}

async function loadYaml() {
  const result = await chrome.storage.local.get('configYaml');
  yamlArea.value = (result.configYaml as string) ?? '';
}

async function saveYaml() {
  if (!validateYaml()) return;
  await chrome.storage.local.set({ configYaml: yamlArea.value });
  renderErrors(['保存しました']);
}

async function exportYaml() {
  try {
    await navigator.clipboard.writeText(yamlArea.value);
    renderErrors(['クリップボードにコピーしました']);
  } catch {
    const exported = prompt('YAMLをコピーしてください', yamlArea.value);
    if (exported != null) {
      renderErrors(['エクスポートしました']);
    }
  }
}

async function importYaml() {
  const imported = prompt('YAMLを貼り付けてください');
  if (imported == null) return;
  yamlArea.value = imported;
  validateYaml();
}

validateButton.addEventListener('click', () => {
  validateYaml();
});

saveButton.addEventListener('click', () => {
  void saveYaml();
});

exportButton.addEventListener('click', () => {
  void exportYaml();
});

importButton.addEventListener('click', () => {
  void importYaml();
});

previewButton.addEventListener('click', () => {
  previewOutput.textContent = 'プレビューはPBI-0007で対応します。';
});

rollbackButton.addEventListener('click', () => {
  renderErrors(['ロールバックはPBI-0007で対応します。']);
});

history.textContent = '履歴はPBI-0007で対応します。';

void loadYaml();
