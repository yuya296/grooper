# Test Strategy

## Goal

- [ ] `regex` / `glob` の両モードが後方互換を保って動作することをE2Eに近い形で確認する

## Preconditions

- [ ] テスト用YAMLに `matchMode` あり/なし双方のルールを用意

## CLI Checks

- [ ] Command: `pnpm test`
  - Expected: `core/config` `core/planner` `extension/ui-state` の新規ケース含め全通過

## Browser Checks

- [ ] URL / Screen: `chrome-extension://<id>/src/extension/options/options.html`
  - Steps: ルール編集ドロワーで `matchMode` を切り替えて保存し、SourceタブでYAML反映を確認
  - Expected: `matchMode` が正しく保存され、再読み込み後も維持される

## Edge Cases

- [ ] `matchMode=regex` で不正正規表現を入力した場合に保存不可
- [ ] `matchMode=glob` で代表パターン（`*.example.com`, `docs/*`）が期待通りに一致
