# Test Strategy

## Goal

- [x] v2設定の parse/compile/planner/UI round-trip が成立することを確認する

## CLI Checks

- [x] Command: `pnpm test`
  - Expected: core/extension/e2e のv2更新ケースを含め全通過
- [x] Command: `pnpm build`
  - Expected: 拡張ビルド成功

## Edge Cases

- [x] `version: 1` / top-level `rules` は parse error
- [x] `groupingStrategy=ruleOnly` は親継承しない
- [x] グループ名 `Team-$1` は展開せずそのまま作成される
- [x] 非一致タブは移動しない（fallbackなし）
