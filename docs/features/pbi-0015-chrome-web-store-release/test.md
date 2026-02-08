# Test Strategy

## Goal

- [ ] 公開準備手順がドキュメント通りに実行でき、申請に必要な入力・成果物が揃うことを確認する（Dashboard入力確認が残）

## Preconditions

- [x] 公開対象バージョンのビルドが作成可能であること
- [x] Chrome Web Store Developer Dashboardへアクセス可能であること

## CLI Checks

- [x] Command: `pnpm build`
  - Expected: 拡張の配布対象ビルドが生成される
- [x] Command: `pnpm test`
  - Expected: 公開前の回帰がない（既存テストが通過）

## Browser / Store Checks

- [x] URL / Screen: README / docs
  - Steps: READMEのDocsセクションから各ドキュメントへ遷移
  - Expected: `getting-started/configuration/examples/maintenance/release` の導線が切れていない
- [x] URL / Screen: Chrome Extensions（ローカル読込）
  - Steps: `dist/extension` を読み込んで基本動作を確認
  - Expected: Popup/Options/自動適用の主要機能が動作する
- [ ] URL / Screen: Chrome Web Store Developer Dashboard
  - Steps: 下書き登録に必要な項目を公開準備ドキュメントに沿って入力
  - Expected: 必須項目の未入力がなく、提出可能状態まで到達できる

## Edge Cases

- [ ] アイコン・スクリーンショット等の素材不足をチェックリストで検出できる
- [ ] 権限説明やプライバシーポリシーURLの未設定をチェックリストで検出できる
