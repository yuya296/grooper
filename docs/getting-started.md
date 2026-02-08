# Getting Started

Grooper は、YAMLルールに従ってChromeタブを自動グルーピングする拡張です。

## 1. Build

```bash
pnpm install
pnpm build
```

## 2. Chromeへ読み込む（開発版）

1. `chrome://extensions` を開く
2. `デベロッパーモード` をON
3. `パッケージ化されていない拡張機能を読み込む` を選択
4. `dist/extension` を指定

## 3. 設定する

1. 拡張の `Options` を開く
2. 初期状態では `newTabs` ベースのデフォルトプリセットが入っていることを確認する
3. 必要なら `Source` タブに `docs/config.sample.yml` を貼り付けて保存する

## 4. 動作確認する

1. ルールに一致するURLを複数タブで開く
2. Popupの `Run now`（または `今すぐ整理`）を押す
3. タブグループが期待どおり作成されることを確認する

## 次に読む

- 設定キー詳細: `docs/configuration.md`
- 設定例: `docs/examples.md`
- 公開手順: `docs/chrome-web-store-release.md`
