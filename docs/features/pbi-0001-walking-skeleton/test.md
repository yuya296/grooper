# Test Strategy

## Goal

- [ ] 手動整理で最小ルールが確実に適用されることを検証

## Preconditions

- [ ] サンプルYAML（1〜2ルール）
- [ ] 3〜5タブの状態（マッチ/非マッチを含む）

## CLI Checks

- [ ] Command:
  - Expected: なし（CLIはPBI-0008で導入）

## Browser Checks

- [ ] URL / Screen: Chrome拡張のPopup
  - Steps:
    - 拡張をロード
    - サンプル設定を保存
    - 「今すぐ整理」を押す
  - Expected:
    - マッチしたタブが指定グループへ移動
    - 非マッチは移動しない

## Edge Cases

- [ ] YAMLが無効な場合は実行されずエラーが表示される
- [ ] 既存グループがある場合は再利用される
