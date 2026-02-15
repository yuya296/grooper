# Test Strategy

## Goal

- [ ] 色設定の共通化とフォールバック実装で回帰がないことを確認する

## CLI Checks

- [x] Command: `pnpm test`
  - Expected: `tests/core/tab-group-colors.test.ts` を含め全通過
- [x] Command: `pnpm build`
  - Expected: 拡張ビルドが成功

## Browser Checks

- [ ] URL / Screen: 実拡張（Chrome/Edge）
  - Steps: color 指定ルールでグループ作成/移動を実行
  - Expected: 色適用可否に関わらずグルーピング処理は失敗しない
