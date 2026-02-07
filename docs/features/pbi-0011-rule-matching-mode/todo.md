# Tasks

- [x] 設計: `matchMode` のYAML仕様（省略時デフォルト、glob仕様）を確定
- [x] 実装: config parser / planner / evaluator を `regex|glob` 対応
- [x] 実装: Options UIに `matchMode` 列・編集項目・バリデーション追加
- [x] テスト: parser/eval/UI state の回帰・追加ケースを整備
- [x] docs更新: spec/test/progress/overviewの整合更新

# Updates

- 2026-02-07: PBI起票。regexに加えてglobマッチを選択可能にする方針で整理。
- 2026-02-07: `rules[].matchMode`（regex/glob）を実装。globは内部でRegExpへ変換して評価する方式を導入。
- 2026-02-07: Options UIへマッチ方式列/ドロワー選択を追加し、regex選択時のみ正規表現バリデーションを実施。
- 2026-02-07: `pnpm test` / `pnpm build` 通過。台帳を `要確認` へ更新（手動確認待ち）。
- 2026-02-07: デフォルト設定（`DEFAULT_CONFIG_YAML` / `docs/config.sample.yml`）を glob ベースへ更新。
