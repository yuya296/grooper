# Chrome Web Store公開手順（Grooper）

このドキュメントは、GrooperをChrome Web Storeへ公開するための正本手順です。

## 1. 事前チェック（必須）

- [ ] `pnpm test` が通る
- [ ] `pnpm build` が通る
- [ ] `dist/extension` をChromeに読み込み、主要機能（Popup/Options/自動振り分け）が動く
- [ ] `src/extension/manifest.json` の `version` をリリース版へ更新
- [ ] ストア掲載素材を準備済み
  - [ ] ストアアイコン（128x128）
  - [ ] スクリーンショット（最低1枚）
  - [ ] 必要に応じてプロモーション画像
- [ ] 公開情報を準備済み
  - [ ] サポートURL（または問い合わせ先）
  - [ ] プライバシーポリシーURL

## 2. 配布パッケージ作成

```bash
pnpm build
cd dist/extension
zip -r ../grooper-extension-vX.Y.Z.zip .
```

- 出力例: `dist/grooper-extension-v0.1.0.zip`
- zip作成前に不要ファイル（ローカルメモ等）が含まれていないことを確認する

## 3. manifest確認ポイント

確認対象: `src/extension/manifest.json`

- `name`: `Grooper`
- `description`: 80文字以内を目安に簡潔に
- `version`: ストア提出ごとにインクリメント
- `minimum_chrome_version`: サポート範囲と矛盾しない値
- `permissions` / `host_permissions`: 必要最小限
- `action.default_title`: 表示名の整合

## 4. 権限説明テンプレート（ストア記載用）

- `tabs`:
  タブURL/タイトルをルール評価し、対象タブをグループへ移動するために使用します。
- `tabGroups`:
  タブグループの作成・更新（グループ名/色/所属変更）に使用します。
- `storage`:
  ユーザー設定（YAML、UI設定、テーマ、言語）を保存するために使用します。
- `alarms`:
  `applyMode=always` 時の定期再評価、およびクリーンアップ処理の定期実行に使用します。
- `host_permissions: <all_urls>`:
  ユーザー定義ルールで任意ドメインを対象にできるようにするために使用します。

## 5. ストア掲載情報テンプレート

### Extension name

`Grooper`

### Summary（短い説明）

`Rule-based tab grouping for Chrome.`

### Detailed description（詳細説明）

```text
Grooper automatically organizes your tabs into Chrome tab groups using YAML rules.

Key features:
- Rule-based grouping with regex or wildcard (glob) patterns
- Manual / only-new-tab / always-apply modes
- Drag-and-drop rule ordering and side-panel rule editing
- Source (YAML) and UI editor with explicit save flow
- Theme (light/dark) and language (ja/en) support

Your settings are stored locally in Chrome storage.
```

### Category

`Productivity`

### Support URL

`<SET_SUPPORT_URL>`

### Privacy policy URL

`<SET_PRIVACY_POLICY_URL>`

## 6. ライセンス・依存ライセンス確認

- プロジェクトライセンス: `LICENSE`（MIT）
- 依存ライセンス確認手順:

```bash
pnpm licenses list
```

補足:
- 依存解決情報不足で失敗する場合は `pnpm install` を先に実行する。
- それでも `pnpm licenses` が使えない場合は、`pnpm-lock.yaml` と各依存パッケージの `license` を目視確認する。

## 7. リリース時更新手順

1. `src/extension/manifest.json` の `version` を更新
2. `pnpm test` / `pnpm build` を実行
3. `dist/grooper-extension-vX.Y.Z.zip` を作成
4. Chrome Web Store Developer Dashboardで既存アイテムを更新
5. 変更点説明（What's new）を記載して提出
