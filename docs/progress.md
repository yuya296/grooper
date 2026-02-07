# 進捗管理

最終更新日: 2026-02-07

## PBIステータス
| PBI | タイトル | 状態 | 根拠 |
| --- | --- | --- | --- |
| 0001 | Walking skeleton | 完了 | MV3拡張の骨組み、build/test基盤、popup手動実行が実装済み |
| 0002 | Rule eval | 完了 | ルール優先度/親子追従/フォールバック評価とユニットテストあり |
| 0003 | Apply modes | 完了 | manual/newTabs/always のイベント駆動適用を実装済み |
| 0004 | Auto cleanup | 完了 | TTL/maxTabs/LRU と Clock 抽象化を実装済み |
| 0005 | Shortcuts | 完了 | commands 経由でグループ移動/解除を実装済み |
| 0006 | Options UI v1 | 完了 | YAML編集/検証/インポート/エクスポート実装に加え、設定編集フローをspecへ文書化済み |
| 0007 | Options UI v2 | 完了 | プレビュー/履歴/ロールバック実装に加え、運用手順の文書化と補強テストを追加済み |
| 0008 | Diag + CLI | 完了 | `__diag__` API と CLI(plan/apply/snapshot/verify) を実装済み |
| 0009 | E2E + CI | 完了 | 失敗時diag(state/plan/log)保存・artifact収集・テストユーティリティ単体テストを追加済み |
| 0010 | Popup + Settings UI modernize | 完了 | Popup導線、Optionsのshadcn系UI統一、Rules D&D+右ドロワー編集、保存フロー/regexバリデーション改善まで実装済み。`pnpm test`/`pnpm build`通過 |
| 0011 | Rule matching mode (regex/glob) | 要確認 | `rules[].matchMode` の追加、glob評価、Options UIの選択・バリデーションを実装済み。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0012 | Dark mode | 未着手 | Popup/Optionsのテーマ切替（light/dark/system）導入計画を作成済み |
| 0013 | i18n (ja/en) | 未着手 | Popup/Optionsの多言語対応（ja/en）導入計画を作成済み |

## 現在のフォーカス
- PBI-0011の最終確認: 実拡張で matchMode(regex/glob) の保存・再読込・マッチ挙動を手動確認する。

## 進捗更新ルール
- 1コミットごとに、該当PBIの状態変化をこのファイルに反映する。
- 状態は `未着手 / 進行中 / 要確認 / 完了` の4種を使う。
- 状態更新時は、最低1行の根拠（実装済み機能またはテスト結果）を残す。
- `要確認` は「実装済みだがE2Eまたは手動確認待ち」の意味で使う。

## 完了判定チェック
- `pnpm test` が通る。
- 対象PBIの `docs/features/pbi-xxxx-*/spec.md` のACに反しない。
- 関連する `docs/features/pbi-xxxx-*/todo.md` を更新済み。
- UIを含む変更は、手動確認手順を docs に追記済み。
