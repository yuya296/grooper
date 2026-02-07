# Tasks

- [x] 設計: キャプチャ展開仕様（`$1`/`$<name>`/`$$`）と展開順序を確定
- [x] 実装: planner評価時にregex match結果をgroupテンプレートへ反映
- [x] 実装: globモード時のキャプチャ記法禁止バリデーション追加
- [x] 実装: Options UIの説明文・バリデーション・エラーメッセージ更新
- [x] テスト: core/config/planner/UIの正逆ケースを追加
- [x] docs更新: spec/test/progress/overview整合更新

# Updates

- 2026-02-07: PBI起票。regexキャプチャを正規表現ライク記法（`$1`, `$<name>`）でgroupへ展開する方針を整理。
- 2026-02-07: `matchMode=regex` 時に `group` の `$1`/`$<name>`/`$$` を展開する処理を planner に追加。
- 2026-02-07: `matchMode=glob` でキャプチャ参照を使った場合は config/UI バリデーションでエラーにするルールを追加。
- 2026-02-07: `pnpm test` / `pnpm build` 通過。台帳を `要確認` へ更新（手動確認待ち）。
- 2026-02-07: ルール編集サイドパネルの項目説明を常時表示からインフォアイコンのホバーツールチップへ統一。
- 2026-02-07: `docs/config.sample.yml` に命名キャプチャ（`$<env>`）で `Example:hoge/fuga` を作る実例を追加。
- 2026-02-07: `rule-template` 単体テストを追加し、`$<name>` / `$$` / 未一致キャプチャを検証。
- 2026-02-07: `docs/config-examples.md` を追加し、regexキャプチャ/ glob の設定例を利用者向けに整理。
