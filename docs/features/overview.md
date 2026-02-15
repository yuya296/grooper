# PBI優先度・依存・進捗

## 優先度レベル
- P0: MVPに必須（コア機能）
- P1: 早期に欲しいがMVP必須ではない
- P2: 余裕があれば早期に取り込む

## 一覧
進捗の詳細は `docs/progress.md` を参照。

| PBI | Priority | Dependencies | 現在状態 | Scope調整メモ |
| --- | --- | --- | --- |
| 0001 Walking skeleton | P0 | - | 完了 | YAML最小スキーマ/正規表現/手動整理までを最小E2Eとして固定 |
| 0002 Rule eval | P0 | 0001 | 完了 | 競合解決はpriority降順→YAML順、評価順は親子→パターン→フォールバック |
| 0003 Apply modes | P0 | 0001 | 完了 | alwaysは低頻度スキャン併用、無限ループ回避を必須化 |
| 0004 Auto cleanup | P0 | 0001 | 完了 | Clock抽象化はこのPBIで導入固定 |
| 0006 Options UI v1 | P1 | 0001 | 完了 | YAML編集/検証/インポート/エクスポートと設定編集フロー文書化まで完了 |
| 0008 Diag + CLI | P1 | 0001 | 完了 | 診断APIは開発/CI限定、CLIはplan/apply/snapshot/verifyのみ |
| 0010 Popup + Settings UI modernize | P1 | 0006,0007 | 完了 | Popup導線、Settings UI刷新、Rulesテーブル+D&D+サイドパネル、保存フロー改善まで反映済み |
| 0011 Rule matching mode (regex/glob) | P1 | 0002,0010 | 完了 | `rules[].matchMode`、glob評価、newTabs適用修正、Options UI編集まで反映済み |
| 0014 Regex capture group expansion | P1 | 0011 | 完了 | regexキャプチャ展開（`$1`/`$<name>`/`$$`）とglob時禁止バリデーション、設定例整備まで反映済み |
| 0005 Shortcuts | P2 | 0001 | 完了 | ショートカットの割当はYAMLのみ（UI設定はPBI-0006以降） |
| 0007 Options UI v2 | P2 | 0006 | 完了 | プレビュー/履歴/ロールバック実装と運用文書化・補強テストまで完了 |
| 0009 E2E + CI | P2 | 0008 | 完了 | 失敗時artifact収集、テストユーティリティ単体テスト、運用文書化まで完了 |
| 0012 Dark mode | P2 | 0010 | 要確認 | themeMode（system/light/dark）導入とPopup/Optionsのダーク配色対応を実装済み。最終手動確認待ち |
| 0013 i18n (ja/en) | P2 | 0010 | 要確認 | Popup/Optionsの多言語対応（ja/en）と言語設定保存を実装済み。実拡張での表示確認待ち |
| 0015 Chrome Web Store公開準備 | P2 | 0010,0012,0013 | 完了 | `main` へのマージ（`2949211`）まで完了。manifest整備、LICENSE追加、公開手順/掲載テンプレ整備と利用者向けdocs再編を反映済み |
| 0016 Settings IA改善（UI先頭・fallbackGroup UI閉塞・matchMode=glob初期値） | P2 | 0010,0011 | 要確認 | Optionsのタブ順/初期表示をUI中心へ変更、fallbackGroup UI閉塞、新規ruleのmatchMode初期glob化まで実装。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0017 Groups policy UI編集（ttlMinutes/maxTabs/lru） | P2 | 0016,0004 | 未着手 | Issue #6 起票。既存機能（cleanup policy）のUI編集対応を追加予定 |
| 0018 並び順/priority/適用優先度の仕様統一 | P2 | 0011,0016 | 未着手 | Issue #7 起票。並び順と優先度概念の仕様を一本化予定 |
| 0019 タブ並びを grouped > ungrouped に整理 | P2 | 0018 | 未着手 | Issue #8 起票。グループ済みタブ優先の視認性改善を実装予定 |
| 0020 parent保持 vs rule matching 優先順位の仕様化 | P2 | 0002,0018 | 未着手 | Issue #9 起票。`parentFollow` とルール一致の競合解決を仕様化予定 |
| 0021 Chrome/Edge 色整合とフォールバック設計 | P2 | 0016 | 未着手 | Issue #10 起票。ブラウザ差異を吸収する色適用戦略を実装予定 |
| 0022 Chakra UI 再評価（ADR更新） | P2 | 0010 | 未着手 | Issue #11 起票。UIライブラリ方針を再評価しADR更新予定 |
