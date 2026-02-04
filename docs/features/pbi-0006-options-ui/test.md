# Test Strategy

## Goal

- [ ] YAML編集/検証/インポート/エクスポートが正しく動作することを検証

## Preconditions

- [ ] 正常/異常なYAMLサンプル

## CLI Checks

- [ ] Command:
  - Expected: なし（CLIはPBI-0008で導入）

## Browser Checks

- [ ] URL / Screen: Optionsページ
  - Steps:
    - YAMLを編集して保存
    - バリデーションエラーを発生させる
    - インポート/エクスポートを実行
  - Expected:
    - 正常時は保存される
    - エラー時は箇所が表示される
    - 取り込み/書き出しが成功する

## Edge Cases

- [ ] 余分なキーがある場合にエラーになる
- [ ] 参照されない変数がある場合の扱い
