# Test Strategy

## Goal

- [ ] parent継承とrule一致の競合時に、`groupingPriority` で挙動を切替できることを確認する

## CLI Checks

- [x] Command: `pnpm test`
  - Expected: `core/config` と `core/planner` の追加ケースを含め全通過
- [x] Command: `pnpm build`
  - Expected: 拡張ビルドが成功する

## Edge Cases

- [ ] `groupingPriority` 未指定時は `inheritFirst` 扱い
- [ ] `parentFollow=false` では `groupingPriority=inheritFirst` でも親継承しない
