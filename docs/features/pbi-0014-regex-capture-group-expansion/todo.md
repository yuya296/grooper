# Tasks

- [ ] 設計: キャプチャ展開仕様（`$1`/`$<name>`/`$$`）と展開順序を確定
- [ ] 実装: planner評価時にregex match結果をgroupテンプレートへ反映
- [ ] 実装: globモード時のキャプチャ記法禁止バリデーション追加
- [ ] 実装: Options UIの説明文・バリデーション・エラーメッセージ更新
- [ ] テスト: core/config/planner/UIの正逆ケースを追加
- [ ] docs更新: spec/test/progress/overview整合更新

# Updates

- 2026-02-07: PBI起票。regexキャプチャを正規表現ライク記法（`$1`, `$<name>`）でgroupへ展開する方針を整理。
