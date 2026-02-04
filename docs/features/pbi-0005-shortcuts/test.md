# Test Strategy

## Goal

- [ ] ショートカットで期待通りにグループ移動/解除できることを検証

## Preconditions

- [ ] 複数グループが存在する状態
- [ ] YAMLにショートカットマッピングが設定されている

## CLI Checks

- [ ] Command:
  - Expected: なし（CLIはPBI-0008で導入）

## Browser Checks

- [ ] URL / Screen: Chrome拡張のショートカット
  - Steps:
    - 次/前のグループ移動ショートカットを実行
    - 特定グループ移動ショートカットを実行
    - 解除ショートカットを実行
  - Expected:
    - 対象タブが期待通りに移動/解除される

## Edge Cases

- [ ] 移動先グループが存在しない場合は作成 or noop の仕様が一貫
- [ ] グループ順序が未定義の場合の扱い
