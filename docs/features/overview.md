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
| 0011 Rule matching mode (regex/glob) | P1 | 0002,0010 | 要確認 | `rules[].matchMode` とglob評価、Options UI編集を実装済み。最終手動確認待ち |
| 0005 Shortcuts | P2 | 0001 | 完了 | ショートカットの割当はYAMLのみ（UI設定はPBI-0006以降） |
| 0007 Options UI v2 | P2 | 0006 | 完了 | プレビュー/履歴/ロールバック実装と運用文書化・補強テストまで完了 |
| 0009 E2E + CI | P2 | 0008 | 完了 | 失敗時artifact収集、テストユーティリティ単体テスト、運用文書化まで完了 |
| 0012 Dark mode | P2 | 0010 | 未着手 | Popup/Optionsのテーマ切替（light/dark/system）を導入する |
| 0013 i18n (ja/en) | P2 | 0010 | 未着手 | Popup/Optionsの多言語対応（ja/en）と言語設定保存を導入する |
