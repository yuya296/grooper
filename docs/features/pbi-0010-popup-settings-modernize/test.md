# Test Strategy

## Goal

- [ ] Popupから設定画面へ遷移でき、モダナイズ後も既存設定操作が維持されることをE2Eで確認する

## Preconditions

- [ ] UIライブラリ採用方針が確定している
- [ ] D&D実装方式（標準機能のみ or `dnd-kit`併用）が確定している
- [ ] Options UIの主要操作（Validate/Save/Preview/Rollback）が実装済み

## CLI Checks

- [ ] Command: `pnpm test && pnpm build`
  - Expected: 既存ユニットテストがすべて成功し、ビルドが通る

## Browser Checks

- [ ] URL / Screen: Popup
  - Steps:
    - 拡張Popupを開く
    - 設定画面導線をクリックする
  - Expected:
    - Optionsページが開く

- [ ] URL / Screen: Options
  - Steps:
    - Source/UIタブを切り替える
    - Validate/Save/Preview/Rollbackを順に実行する
  - Expected:
    - 既存機能と同等の結果が得られる
    - レイアウト崩れなく操作できる

## Edge Cases

- [ ] Popupの狭い表示領域でも導線が欠けず、誤タップしない
- [ ] 不正YAML時でもエラー表示が視認可能で、UIが壊れない
