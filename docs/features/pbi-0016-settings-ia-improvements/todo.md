# Tasks

- [x] 設計: 導線変更の範囲（UI先頭/初期タブ/fallback閉塞）を確定
- [x] 実装: Source/UIタブを `UI -> Source` へ変更し、初期タブをUIへ変更
- [x] 実装: `fallbackGroup` 編集UIを閉塞（YAML互換は維持）
- [x] 実装: ルール追加時 `matchMode` 初期値を `glob` に変更
- [x] テスト: `pnpm test` / `pnpm build` で回帰確認
- [x] docs更新: PBI-0016のspec/todo/testを追加

# Updates

- 2026-02-15: PBI-0016 着手。Issue #5 の内容を作業単位に分解。
- 2026-02-15: Options のタブ順と初期表示を UI 中心に変更。
- 2026-02-15: `fallbackGroup` 編集UIを閉塞し、YAML互換は維持する方針で実装。
- 2026-02-15: ルール新規作成の `matchMode` 初期値を `glob` へ変更。
- 2026-02-15: `pnpm test` / `pnpm build` 通過。ブラウザでの最終手動確認待ち。
