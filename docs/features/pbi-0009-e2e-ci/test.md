# Test Strategy

## Goal

- [ ] Playwrightで主要シナリオを再現し、CIで安定して回ることを確認

## Preconditions

- [ ] 診断API/CLIが利用可能（PBI-0008完了）

## CLI Checks

- [ ] Command: pnpm e2e
  - Expected: 主要シナリオがパスする

## Browser Checks

- [ ] URL / Screen: Headless Chrome + 拡張
  - Steps:
    - 拡張をロード
    - タブ操作を自動で行う
  - Expected:
    - 仕様通りにグルーピング/自動整理が行われる

## Edge Cases

- [ ] 失敗時にplan/state/logが保存される
- [ ] タイミング依存を減らすリトライや待機戦略が機能する
