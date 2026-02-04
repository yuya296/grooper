const yamlArea = document.getElementById('yaml') as HTMLTextAreaElement;
const errors = document.getElementById('errors') as HTMLDivElement;

function setErrors(message: string) {
  errors.textContent = message;
}

chrome.storage.local.get('configYaml').then((result) => {
  yamlArea.value = (result.configYaml as string) ?? '';
});

setErrors('Optionsは後続PBIで実装予定です。');

const buttons = document.querySelectorAll('button');
buttons.forEach((button) => {
  button.addEventListener('click', () => {
    setErrors('Optionsは後続PBIで実装予定です。');
  });
});
