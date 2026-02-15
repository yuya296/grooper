# 全体設計

## 目的
- YAML を唯一の正（SSOT）として、タブ整理の振る舞いを一貫させる。
- 自動/手動の操作を同じコアロジックで処理し、テスト容易性を最大化する。

## コンポーネント
- Config
  - YAML（v2）→ スキーマ検証 → compiled config。
- State Snapshot
  - tabs/groups/lastActiveAt などの状態取得。
- Planner（pure）
  - 入力: `(state, config, options)`
  - 出力: `plan`（操作の順序付きリスト）
- Executor（Chrome API）
  - `plan` を `chrome.tabs` / `chrome.tabGroups` で実行。
- Diagnostics
  - `__diag__` 名前空間のメッセージAPI（開発/CI限定）。
- UI
  - Options（UI編集 + Source YAML編集）、Popup（手動実行）。
- CLI
  - `plan/apply/snapshot/verify` を提供。

## データフロー
```
[event]
   ↓
[state snapshot] → [planner] → [plan] → [executor]
                        ↓
                    [logs]
```

## plan の最小操作
- `ensureGroup(group, color, windowId)`
- `moveTab(tabId, group, windowId)`
- `closeTab(tabId, reason)`

## 適用モード
- `manual / newTabs / always` を YAML で切替。
- `always` はイベント駆動 + 低頻度再スキャンを併用。

## Planner評価順（v2）
- `groupingStrategy=inheritFirst`: 親継承 → ルール一致
- `groupingStrategy=ruleFirst`: ルール一致 → 親継承
- `groupingStrategy=ruleOnly`: ルール一致のみ

ルール一致は `groups` の定義順、次に各 `group.rules` の定義順で評価する。

## ルールとグループの関係
- ドメインモデルは `Group 1 - n Rule`。
- Rule は `pattern/matchMode` のみを持ち、所属Groupの `name/color/cleanup` を継承する。
- `dynamic group name` 展開（`$1`, `$<name>`, `$$`）は現行仕様では無効化し、文字列リテラルとして扱う。

## クリーンアップ
- `groups[].cleanup` を利用して TTL / maxTabs / LRU を適用する。
- cleanup は既存タブグループ名と `Group.name` を照合して実行する。

## 状態/ログ
- スナップショットと plan は JSON で保存可能。
- 失敗時に復旧しやすい形式を維持する。
