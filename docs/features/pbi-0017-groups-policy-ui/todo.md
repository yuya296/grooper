# Tasks

- [x] 設計: Groups policy 編集UIの項目を確定（group/color/ttl/maxTabs/lru）
- [x] 実装: `uiState` に groups 双方向同期を追加
- [x] 実装: Options UI に Group policies セクション（追加・編集・削除）を追加
- [x] 実装: i18n 文言（ja/en）を追加
- [x] テスト: `pnpm test` / `pnpm build` で回帰確認
- [x] docs更新: PBI-0017のspec/todo/testを追加

# Updates

- 2026-02-15: PBI-0017 着手。Issue #6 をもとに UI 編集対象を確定。
- 2026-02-15: `parseYamlForUi/buildYamlFromUi` を `groups` 対応に拡張。
- 2026-02-15: Options UI に Group policies テーブルを追加し、追加・編集・削除を実装。
- 2026-02-15: `pnpm test` / `pnpm build` 通過。手動確認待ち。
