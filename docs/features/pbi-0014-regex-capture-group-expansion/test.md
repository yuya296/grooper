# Test Strategy

## Goal

- [ ] regexキャプチャ展開が期待通り動作し、glob/既存設定との互換が保たれることを確認する

## Preconditions

- [ ] `matchMode=regex` と `matchMode=glob` の比較用設定を用意
- [ ] 命名キャプチャ/番号キャプチャ双方のテストデータを準備

## CLI Checks

- [ ] Command: `pnpm test`
  - Expected: `core/config` `core/planner` `extension/ui-state` の追加ケースを含め全通過

## Browser Checks

- [ ] URL / Screen: `chrome-extension://<id>/src/extension/options/options.html`
  - Steps: regexモードで `group` に `$1` / `$<name>` を入力して保存
  - Expected: Sourceに反映され、実行時に期待グループ名へ移動される

## Edge Cases

- [ ] `matchMode=glob` で `$1` や `$<name>` を指定したらエラー
- [ ] `$$` が `$` として解釈される
- [ ] 未一致キャプチャ参照は空文字扱いで落ちない
