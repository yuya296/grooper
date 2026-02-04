# PBI優先度と範囲調整

## 優先度レベル
- P0: MVPに必須（コア機能）
- P1: 早期に欲しいがMVP必須ではない
- P2: 余裕があれば早期に取り込む

## 優先度一覧
| PBI | Priority | Dependencies | Scope調整メモ |
| --- | --- | --- | --- |
| 0001 Walking skeleton | P0 | - | YAML最小スキーマ/正規表現/手動整理までを最小E2Eとして固定 |
| 0002 Rule eval | P0 | 0001 | 競合解決はpriority降順→YAML順、評価順は親子→パターン→フォールバック |
| 0003 Apply modes | P0 | 0001 | alwaysは低頻度スキャン併用、無限ループ回避を必須化 |
| 0004 Auto cleanup | P0 | 0001 | Clock抽象化はこのPBIで導入固定 |
| 0006 Options UI v1 | P1 | 0001 | UIはYAML編集/検証/インポート/エクスポートのみ（プレビュー/履歴はPBI-0007） |
| 0008 Diag + CLI | P1 | 0001 | 診断APIは開発/CI限定、CLIはplan/apply/snapshot/verifyのみ |
| 0005 Shortcuts | P2 | 0001 | ショートカットの割当はYAMLのみ（UI設定はPBI-0006以降） |
| 0007 Options UI v2 | P2 | 0006 | プレビュー/履歴/ロールバックに限定 |
| 0009 E2E + CI | P2 | 0008 | E2E/CIのみ、機能追加は行わない |
