# Test Strategy

## Goal

- [ ] Group policies の UI編集が YAML同期・保存フローと整合することを確認する

## CLI Checks

- [x] Command: `pnpm test`
  - Expected: 既存ユニットテスト + ui-state テストが通過
- [x] Command: `pnpm build`
  - Expected: 拡張ビルドが成功する

## Browser Checks

- [ ] URL / Screen: `http://localhost:4173/options.html`
  - Steps: Group policies セクションで行追加し、group/color/ttl/maxTabs/lru を入力して保存
  - Expected: Source の YAML に `groups` が反映される
- [ ] URL / Screen: `http://localhost:4173/options.html`
  - Steps: 再読み込み後に Group policies の値を確認
  - Expected: 保存した値が維持される

## Edge Cases

- [ ] group名が空の行は `groups` 出力に含まれない
- [ ] 数値入力が空/不正な場合は該当キーを出力しない
