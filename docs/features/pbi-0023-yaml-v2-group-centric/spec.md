# Requirement

- [x] Purpose / value: 設定概念を Group 中心モデルに再定義し、仕様理解コストと運用時の誤解を減らす。
- [x] Scope:
  - `version: 2` の導入（`groups[].rules[]`）
  - top-level `rules[]` / `fallbackGroup` / `priority` の廃止
  - `parentFollow + groupingPriority` を `groupingStrategy` に統合
  - color を `groups[].color` に統一
  - dynamic group name（`$1`, `$<name>`, `$$`）を閉塞し、展開なしでリテラル扱い
  - core / options UI / docs / tests の全面更新
- [x] Out of scope:
  - v1 互換レイヤーの提供
  - dynamic group name の再導入（後続PBI）
- [x] Assumptions:
  - 破壊的変更として v1 は parse error 扱い
  - `groupingStrategy` default は `inheritFirst`
  - 非一致タブは no-op（移動しない）
- [x] Risks:
  - 既存設定の移行負荷が一時的に増える
  - UI編集のデータ構造変更で回帰が出やすい

# Acceptance Criteria

- [x] AC1: v2 YAML（`groups[].rules[]`）を parse/compile できる。
- [x] AC2: planner が `groupingStrategy`（`inheritFirst | ruleFirst | ruleOnly`）で期待通り分岐する。
- [x] AC3: dynamic group name 記法は展開されず、リテラルとして扱われる。
- [x] AC4: Options UI で Group（name/color/cleanup）と Group 内 Rule の編集/保存/再読込ができる。
- [x] AC5: `pnpm test` / `pnpm build` が通る。

# Notes

- dynamic group name 再導入時は `groupTemplate` などの明示キーで opt-in する方針。
