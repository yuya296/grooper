# Requirement

- [ ] Purpose / value: 親タブ継承とルール一致が衝突した際の挙動を設定で制御できるようにし、挙動の予測可能性を高める。
- [ ] Scope:
  - `groupingPriority` 設定（`inheritFirst` / `ruleFirst`）を追加
  - planner の評価順を設定に応じて切替
  - config parser / types / tests を更新
  - configuration/architecture ドキュメント更新
- [ ] Out of scope:
  - `parentFollow` 自体の廃止
  - UIに `groupingPriority` 編集項目を追加
- [ ] Assumptions:
  - 既存互換のため default は `inheritFirst`
- [ ] Risks:
  - `parentFollow=false` と `groupingPriority` の組み合わせ理解が難しい

# Acceptance Criteria

- [ ] AC1: `groupingPriority=ruleFirst` でルール一致が親継承より優先される。
- [ ] AC2: 未指定時は従来通り `inheritFirst` 動作になる。
- [ ] AC3: `pnpm test` / `pnpm build` が通る。

# Notes

- `parentFollow=false` の場合は親継承自体を無効化する。
