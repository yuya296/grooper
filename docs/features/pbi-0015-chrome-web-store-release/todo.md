# Tasks

- [x] 設計: Chrome Web Store公開に必要な成果物一覧を確定
- [x] 実装: 公開向け `manifest` 値・パッケージ作成手順を整備
- [x] 実装: `LICENSE` と依存ライセンス確認手順を整備
- [x] 実装: ストア掲載情報テンプレート（概要/詳細/カテゴリ/サポート）を作成
- [x] 実装: 利用者向けドキュメント導線を再編（getting-started/configuration/examples/maintenance）
- [ ] テスト: 公開チェックリストで提出準備の再現性を確認（Dashboard入力は手動実施待ち）
- [x] docs更新: `overview/progress` と公開運用ドキュメントを更新

# Updates

- 2026-02-07: PBI起票。公開に必要なmanifest/ライセンス/申請ドキュメント整備を1PBIで実施する方針を確定。
- 2026-02-07: `manifest` に公開向けメタデータ（`short_name`, `version_name`, `homepage_url`, `minimum_chrome_version`, `action.default_title`）を追加。
- 2026-02-07: `LICENSE`（MIT）を追加し、依存ライセンス確認フローを `docs/chrome-web-store-release.md` に明記。
- 2026-02-07: 公開運用ドキュメント（チェックリスト、zip作成手順、掲載情報テンプレート、権限説明）を `docs/chrome-web-store-release.md` に集約。
- 2026-02-07: `pnpm test` / `pnpm build` は通過。Dashboard下書き入力の手動確認が残タスク。
- 2026-02-08: ドキュメント構成を再編。`docs/getting-started.md`, `docs/configuration.md`, `docs/examples.md`, `docs/maintenance.md` を追加し、README導線を更新。
- 2026-02-08: `docs/config-examples.md` は移行案内に変更し、設定例の正本を `docs/examples.md` へ統一。
