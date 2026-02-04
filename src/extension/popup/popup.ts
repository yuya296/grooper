const button = document.getElementById('run') as HTMLButtonElement;
const status = document.getElementById('status') as HTMLDivElement;

function setStatus(message: string) {
  status.textContent = message;
}

button.addEventListener('click', () => {
  setStatus('実行中...');
  chrome.runtime.sendMessage({ type: 'run-manual' }, (response) => {
    if (chrome.runtime.lastError) {
      setStatus(`エラー: ${chrome.runtime.lastError.message}`);
      return;
    }
    if (!response?.ok) {
      const errors = response?.errors?.map((e: { path: string; message: string }) => `${e.path}: ${e.message}`).join(', ');
      setStatus(`失敗: ${errors ?? 'unknown error'}`);
      return;
    }
    setStatus('完了');
  });
});
