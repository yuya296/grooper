# Test Strategy

## Goal

- [ ] applyModeごとに適用タイミングが正しいことを検証

## Preconditions

- [ ] 3種類のapplyModeを含む設定

## CLI Checks

- [ ] Command:
  - Expected: なし（CLIはPBI-0008で導入）

## Browser Checks

- [ ] URL / Screen: Popup + 新規タブ作成
  - Steps:
    - manualで新規タブを作成（自動が動かないことを確認）
    - newTabsで新規タブを作成
    - alwaysでURL更新/アクティブ切替
  - Expected:
    - モードに応じて自動適用される/されない

## Edge Cases

- [ ] 同一イベントで連続適用されない
- [ ] 無限ループが発生しない
