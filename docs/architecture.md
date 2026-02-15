# 全体設計

## 目的
- YAMLを唯一の正（SSOT）として、タブ整理の振る舞いを一貫させる。
- 自動/手動の操作を同じコアロジックで処理し、テスト容易性を最大化する。

## コンポーネント
- Config
  - YAML → スキーマ検証 → compiled config。
- State Snapshot
  - tabs/groups/lastActiveAt などの状態取得。
- Planner（pure）
  - 入力: (state, config, event, clock)
  - 出力: plan（操作の順序付きリスト）
- Executor（Chrome API）
  - plan を chrome.tabs / chrome.tabGroups で実行。
- Diagnostics
  - `__diag__` 名前空間のメッセージAPI（開発/CI限定）。
- UI
  - Options（YAML編集/検証/プレビュー/履歴）、Popup（手動実行）。
- CLI
  - plan/apply/snapshot/verify を提供。

## データフロー
```
[event]
   ↓
[state snapshot] → [planner] → [plan] → [executor]
                        ↓
                    [logs]
```

## plan の最小操作（例）
- createGroup(title, color)
- moveTab(tabId, groupId)
- closeTab(tabId)
- ungroup(tabId)

## 適用モード
- manual/newTabs/always をYAMLで切替。
- always はイベント駆動 + 低頻度の再スキャンを併用可能。

## Planner評価順（仕様）
- 1) `groupingPriority` に従い、`inheritFirst` なら親追従→ルール、`ruleFirst` ならルール→親追従の順で評価
- 2) ルール評価: `rules[]` を `priority` 降順、同値はYAML順で評価
- 3) fallback: 非一致時に `fallbackGroup` を適用

補足:
- Options UI のルール並び替えは、保存時に `priority` を再採番して評価順と同期する。
- `matchMode` は parser既定=`regex`、UI新規作成時既定=`glob` を採用している。

## 状態/ログ
- スナップショットとplanはJSONで保存可能。
- 失敗時に復旧しやすい形式を維持する。
