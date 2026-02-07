# Tasks

- [x] 要件確認: Popup導線の配置と文言を確定
- [x] 設計: UIコンポーネントライブラリ候補比較（採用理由/非採用理由）を作成
- [x] 合意: UIコンポーネントライブラリ採用案を確定
- [x] 設計: D&Dリストなど必要パーツの標準提供可否を候補ごとに棚卸し
- [x] 設計: 画面構成（Popup/Options）と段階移行方針を定義
- [x] 実装: Popupに設定画面への導線を追加
- [x] 実装: Options UIのモダナイズ（既存機能維持）
- [x] 実装: RulesテーブルのD&D並び替えを追加
- [x] 実装: タイトルクリックで開くサイドパネル詳細編集を追加
- [x] テスト: 既存テスト更新と回帰確認
- [x] docs更新: 操作フロー/ライブラリ採用判断/変更点を反映

# Updates

- 2026-02-07: PBI起票。実装前にライブラリ選定の合意を取る方針で開始。
- 2026-02-07: 設計ドキュメント（design.md）を追加。候補比較、D&D方針、UI構成、段階移行方針を定義。
- 2026-02-07: 評価軸を「単体標準提供」から「テーブル/ D&Dの実務構成（shadcn + TanStack + dnd-kit）での実現性」へ更新。
- 2026-02-07: ライブラリ方針を確定（shadcnテーブル + D&D + タイトルクリックで右サイドパネル詳細編集）。
- 2026-02-07: ADR-1を追加し、Rules UIの技術選定（shadcn + TanStack + dnd-kit）を記録。
- 2026-02-07: Popupへ設定導線を追加し、OptionsをReact/TanStack/D&D構成へ移行。`pnpm test`/`pnpm build`通過。
- 2026-02-07: 詳細編集を常設サイド領域から、タイトルクリックで右から開くスライドパネルUIへ更新。
- 2026-02-07: Rulesテーブル列を調整（Group列をクリック編集の主キー、Header列はpattern表示）。
- 2026-02-07: テーブル列名をPatternへ変更し、サイドパネル項目順をテーブル順（Group→Pattern→Status→Target）に統一。
- 2026-02-07: color入力をChromeタブグループ対応色のみのプルダウンへ変更し、テーブル/詳細で色ドット表示を追加。
- 2026-02-07: colorプルダウンをネイティブselectからRadix Select（shadcn系UI）へ変更し、メニュー項目内の色ドット表示を追加。
- 2026-02-07: applyModeをRadix Selectへ置換、fallback有効化をRadix Switchへ置換してネイティブUIを削減。
- 2026-02-07: fallback Switchのthumb位置ずれを修正（Radix Switchの座標/移動量を調整）。
- 2026-02-07: Source/UIタブ切替を手作りボタンからRadix Tabsへ置換し、タブUIをshadcn系に統一。
