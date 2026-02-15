# Test Strategy

## Goal

- [ ] v2設定の parse/compile/planner/UI round-trip が成立することを確認する

## CLI Checks

- [ ] Command: `pnpm test`
  - Expected: core/extension/e2e のv2更新ケースを含め全通過
- [ ] Command: `pnpm build`
  - Expected: 拡張ビルド成功

## Edge Cases

- [ ] `version: 1` / top-level `rules` は parse error
- [ ] `groupingStrategy=ruleOnly` は親継承しない
- [ ] グループ名 `Team-$1` は展開せずそのまま作成される
- [ ] 非一致タブは移動しない（fallbackなし）
