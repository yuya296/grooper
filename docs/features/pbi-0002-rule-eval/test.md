# Test Strategy

## Goal

- [ ] 親子追従・フォールバック・優先度・変数展開が正しく動くことを検証

## Preconditions

- [ ] 親子関係のあるタブ状態
- [ ] マッチ/非マッチ/競合するルールを含む設定

## CLI Checks

- [ ] Command:
  - Expected: なし（CLIはPBI-0008で導入）

## Browser Checks

- [ ] URL / Screen: Popup手動実行
  - Steps:
    - 親タブからリンクを開いて子タブを生成
    - 「今すぐ整理」を実行
  - Expected:
    - 子タブが親と同じグループへ移動
    - 親なしタブはフォールバックへ移動

## Edge Cases

- [ ] 未定義変数参照時にエラーになる
- [ ] 優先度が同じ場合の決定規則が一貫している
