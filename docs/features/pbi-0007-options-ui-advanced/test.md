# Test Strategy

## Goal

- [ ] プレビュー/履歴/ロールバックが期待通り動くことを検証

## Preconditions

- [ ] 変更前後で振り分けが変わるYAML

## CLI Checks

- [ ] Command:
  - Expected: なし（CLIはPBI-0008で導入）

## Browser Checks

- [ ] URL / Screen: Optionsページ
  - Steps:
    - YAMLを変更
    - プレビューを表示
    - 保存して履歴を確認
    - ロールバック実行
  - Expected:
    - プレビュー結果が表示される
    - 履歴が追加される
    - ロールバックで元に戻る

## Edge Cases

- [ ] プレビュー生成に失敗した場合のエラーハンドリング
- [ ] 履歴が上限に達した場合の削除ルール
