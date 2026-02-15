# Maintenance Guide

日常運用・リリース時のメンテナンス手順です。

## 日常運用

1. 変更後にテストを実行

```bash
pnpm test
pnpm build
```

2. PBIドキュメントを更新
- `docs/features/pbi-xxxx-*/todo.md` のチェック更新
- `docs/features/overview.md` / `docs/progress.md` の状態更新

3. 設定ドキュメントを同期
- 新しい設定キーを追加した場合:
  - `docs/configuration.md` を更新
  - 必要に応じて `docs/examples.md` に具体例を追加

## リリース運用

Chrome Web Store提出の詳細手順は以下を参照:
- `docs/chrome-web-store-release.md`

最小フロー:
1. `src/extension/manifest.json` の `version` を更新
2. `pnpm test` / `pnpm build`
3. `dist/extension` から zip 作成
4. ストア下書き更新・提出

## ドキュメント運用方針

- 現在は `docs/` を正本として運用する
- docs site（Docusaurus）は公開前フェーズで導入する
- 導入時はこの構成をそのまま移植する:
  - `getting-started.md`
  - `configuration.md`
  - `examples.md`
  - `maintenance.md`
  - `chrome-web-store-release.md`
