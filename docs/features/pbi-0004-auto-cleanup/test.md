# Test Strategy

## Goal

- [ ] TTL/上限/LRUが期待通りにclose対象を選ぶことを検証

## Preconditions

- [ ] 異なる最終アクティブ時刻のタブ群
- [ ] maxTabsを超過するグループ

## CLI Checks

- [ ] Command:
  - Expected: なし（CLIはPBI-0008で導入）

## Browser Checks

- [ ] URL / Screen: Popup手動実行
  - Steps:
    - TTL超過状態をClockで再現
    - 「今すぐ整理」を実行
  - Expected:
    - TTL/上限に応じて古いタブがクローズ対象になる

## Edge Cases

- [ ] TTLと上限が同時に有効な場合の優先度が一貫する
- [ ] 最終アクティブが未取得のタブの扱い
