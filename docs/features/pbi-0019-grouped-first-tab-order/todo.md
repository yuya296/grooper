# Tasks

- [x] 設計: grouped-first 並び替えアルゴリズムを定義
- [x] 実装: `core/tab-order.ts` に純粋関数を追加
- [x] 実装: `executor` の plan実行後に grouped-first 並び替えを適用
- [x] 実装: command操作（group/ungroup）後にも並び替えを適用
- [x] テスト: tab-orderユニットテスト追加、`pnpm test` / `pnpm build` で回帰確認
- [x] docs更新: PBI-0019のspec/todo/testを追加

# Updates

- 2026-02-15: PBI-0019 着手。Issue #8 の grouped-first 要件をアルゴリズム化。
- 2026-02-15: `core/tab-order.ts` と `tests/core/tab-order.test.ts` を追加。
- 2026-02-15: `executePlan` 後とコマンド操作後に grouped-first 整列を適用。
- 2026-02-15: `pnpm test` / `pnpm build` 通過。手動確認待ち。
