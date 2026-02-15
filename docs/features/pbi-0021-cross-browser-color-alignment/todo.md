# Tasks

- [x] 設計: 共通色定義 + 失敗時フォールバック方針を確定
- [x] 実装: `core/tab-group-colors.ts` を追加し、UI色定義を共通化
- [x] 実装: `executor` で色適用失敗時に色なし更新へフォールバック
- [x] 実装: 色ユーティリティのテスト追加
- [x] テスト: `pnpm test` / `pnpm build` の最終確認
- [x] docs更新: PBI-0021のspec/todo/testを追加

# Updates

- 2026-02-15: PBI-0021 着手。Issue #10 の色差分課題を実装方針へ落とし込み。
- 2026-02-15: 色セットを `core/tab-group-colors.ts` に集約し、Options UIへ適用。
- 2026-02-15: `tabGroups.update` 失敗時に色なし更新へフォールバックする安全処理を追加。
- 2026-02-15: `pnpm test` / `pnpm build` 通過。手動確認待ち。
- 2026-02-15: `rules[].color` 未指定時に `groups.<name>.color` を補完するよう planner を修正し、色適用の揺れを抑制。
