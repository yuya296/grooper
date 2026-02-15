# 進捗管理

最終更新日: 2026-02-15

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
| 0011 | Rule matching mode (regex/glob) | 完了 | `rules[].matchMode` の追加、glob評価、newTabs適用修正、Options UIの選択・バリデーションまで実装済み。`pnpm test`/`pnpm build`通過 |
| 0012 | Dark mode | 要確認 | themeMode（system/light/dark）の永続化、Optionsテーマ選択UI、Popup/Optionsのダーク配色対応を実装済み。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0013 | i18n (ja/en) | 要確認 | `language`（ja/en）設定、Popup/Options文言キー化、初回言語解決ロジックを実装済み。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0014 | Regex capture group expansion | 完了 | regexキャプチャ（`$1`, `$<name>`, `$$`）のgroup展開、globモード禁止バリデーション、設定例整備まで実装済み。`pnpm test`/`pnpm build`通過 |
| 0015 | Chrome Web Store公開準備 | 完了 | `main` へのマージ（`2949211`）まで完了。公開向けmanifest/ライセンス/公開手順と利用者向けdocs導線の整備を反映済み |
| 0016 | Settings IA改善（UI先頭・fallbackGroup UI閉塞・matchMode=glob初期値） | 要確認 | Optionsのタブ順/初期表示をUI中心へ変更、fallbackGroup UI閉塞、新規ruleのmatchMode初期glob化を実装。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0017 | Groups policy UI編集（ttlMinutes/maxTabs/lru） | 要確認 | Group policies UI（group/color/ttl/maxTabs/lru）とYAML同期を実装。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0018 | 並び順/priority/適用優先度の仕様統一 | 要確認 | `docs/configuration.md` と `docs/architecture.md` に評価順（parentFollow→rules→fallback）と優先度規則、default方針（parser=regex/UI新規=glob）を明文化 |
| 0019 | タブ並びを grouped > ungrouped に整理 | 要確認 | grouped-first 並び替え（非pinned領域）を実装。`executePlan` 後とコマンド操作後に適用し、`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0020 | parent保持 vs rule matching 優先順位の仕様化 | 要確認 | `groupingPriority`（inheritFirst/ruleFirst）を追加し、`parentFollow` との組み合わせで評価順を制御可能化。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0021 | Chrome/Edge 色整合とフォールバック設計 | 要確認 | 色定義を共通化し、`tabGroups.update` の色適用失敗時は色なし更新へフォールバックする安全処理を実装。`pnpm test`/`pnpm build`通過、手動確認待ち |
| 0022 | Chakra UI 再評価（ADR更新） | 完了 | `docs/adr/ADR-2-keep-shadcn-radix-and-defer-chakra-migration.md` を追加し、当面は現行維持（shadcn系 + Radix）方針を確定 |

## 現在のフォーカス
- PBI-0012の最終確認: light/dark/system の切替・保存・再読込反映を実拡張で手動確認する。

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
