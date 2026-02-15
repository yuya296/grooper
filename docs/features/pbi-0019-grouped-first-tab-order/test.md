# Test Strategy

## Goal

- [ ] grouped/ungrouped 混在時に grouped-first が維持されることを確認する

## CLI Checks

- [x] Command: `pnpm test`
  - Expected: `tests/core/tab-order.test.ts` を含め全通過
- [x] Command: `pnpm build`
  - Expected: 拡張ビルドが成功

## Browser Checks

- [ ] URL / Screen: 実拡張読み込み後の任意window
  - Steps: grouped/ungrouped を混在させた状態で `Run now` とショートカット移動を実行
  - Expected: 非pinned領域で grouped が先、ungrouped が後に並ぶ
