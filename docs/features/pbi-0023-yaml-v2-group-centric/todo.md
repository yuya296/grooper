# Tasks

- [x] 設計: v2 Group中心モデルの仕様確定（破壊的変更）
- [x] 実装: `src/core/types.ts` / `src/core/config.ts` / `src/core/planner.ts` のv2化
- [x] 実装: `src/core/rule-template.ts` を pattern妥当性責務へ整理
- [x] 実装: Options UI state / Options UI を groups[].rules[] モデルへ再編
- [x] 実装: fallback / priority / dynamic group展開ロジック削除
- [x] テスト: core / options state / e2e をv2仕様へ更新
- [x] docs更新: configuration / architecture / config.sample / examples をv2へ更新
- [x] 最終確認: `pnpm test` / `pnpm build`

# Updates

- 2026-02-15: PBI-0023 着手。YAMLをv2（Group中心）へ再定義し、dynamic group name を閉塞する方針で実装開始。
- 2026-02-15: core/types/config/planner/cleanup をv2モデルへ更新し、`groupingStrategy` と `groupsByName` を導入。
- 2026-02-15: Options UI を Group中心編集へ再編し、`groupingStrategy` セレクタを追加。
- 2026-02-15: `pnpm test` / `pnpm build` 通過。手動確認待ち。
