# Tasks

- [x] 設計: i18n方式（Chrome i18n or app内辞書）とキー命名規則を確定
- [x] 実装: Popup/Options文言をキー化し `ja` / `en` リソース作成
- [x] 実装: 言語選択UIと永続化、初期言語解決ロジックを追加
- [x] テスト: 言語切替時の表示・操作回帰とレイアウト崩れを確認
- [x] docs更新: 文言追加時の運用ルールを追記

# Updates

- 2026-02-07: PBI起票。まず `ja/en` の2言語を対象に段階導入する方針で整理。
- 2026-02-07: `src/extension/i18n.ts` を新設し、`language`（ja/en）を `chrome.storage.local` へ保存する方式で実装。
- 2026-02-07: Optionsヘッダーに言語セレクタを追加。Popup/Optionsで文言キーを参照して即時切替対応。
- 2026-02-07: 初回言語は `chrome.i18n.getUILanguage()` / `navigator.language` から解決、未対応ロケールは `en` へフォールバック。
- 2026-02-07: `tests/extension/i18n.test.ts` を追加。`pnpm test` / `pnpm build` 通過。
