# Test Strategy

## Goal

- [ ] 主要画面の言語切替が正しく動作し、既存機能の操作性が維持されることを確認する

## Preconditions

- [ ] `ja` / `en` の翻訳リソースが用意されていること

## CLI Checks

- [ ] Command: `pnpm test`
  - Expected: i18n対応後も既存テストが通過し、必要な新規テストが追加されている

## Browser Checks

- [ ] URL / Screen: options + popup
  - Steps: 日本語/英語を切替えて保存し、再読み込み
  - Expected: 文言が統一して切替わり、主要操作が継続して実行可能

## Edge Cases

- [ ] ブラウザ言語が未対応ロケールの場合に既定言語へフォールバック
- [ ] 英語文言でボタン/テーブルのレイアウト崩れが発生しない
