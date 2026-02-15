# Tasks

- [x] 設計: `groupingPriority`（inheritFirst/ruleFirst）の仕様を確定
- [x] 実装: core types / config schema / planner を更新
- [x] テスト: config/planner/cleanup の型整合・挙動テストを更新
- [x] docs更新: configuration/architecture と PBI-0020 spec/todo/test を更新
- [x] テスト: `pnpm test` / `pnpm build` の最終確認

# Updates

- 2026-02-15: PBI-0020 着手。Issue #9 の論点を設定化で解決する方針を採用。
- 2026-02-15: `groupingPriority` を config に追加し、planner評価順を切替可能にした。
- 2026-02-15: `ruleFirst` 時に親継承よりルール一致が優先されるテストケースを追加。
- 2026-02-15: `pnpm test` / `pnpm build` 通過。手動確認待ち。
