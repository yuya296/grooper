# Test Strategy

## Goal

- [ ] テーマ切替が永続化され、Popup/Options双方で一貫して反映されることを確認する

## Preconditions

- [ ] options画面でテーマ設定UIが有効であること

## CLI Checks

- [ ] Command: `pnpm test`
  - Expected: 既存ユニットテストが回帰なく通過

## Browser Checks

- [ ] URL / Screen: options + popup
  - Steps: `light` / `dark` / `system` を切替えて保存し、再読み込み
  - Expected: 保存値どおりのテーマで表示される

## Edge Cases

- [ ] OSテーマ変更時に `system` が追従する
- [ ] ダークモードでテーブル、ドロワー、トーストのコントラストが崩れない
