# Configuration Reference

Grooper の設定は YAML で管理します。

## 初期プリセット（インストール直後）

初期状態では「効果をすぐ体感できる」ことを優先し、以下方針のプリセットが入っています。

- `applyMode: newTabs`（新規タブに限定して自動整理）
- `fallbackGroup` は未設定（過剰な自動回収を防ぐ）
- `Work / Docs / Search / Media / Social` を中心に汎用globで整理

正本: `docs/config.sample.yml`

## 最小構成

```yaml
version: 1
applyMode: manual
rules:
  - pattern: '*example.com*'
    matchMode: glob
    group: 'Example'
```

## ルートキー

| Key | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `version` | `number` | yes | `1` | 現在は `1` 固定 |
| `applyMode` | `manual \| newTabs \| always` | yes | `manual` | 適用タイミング |
| `parentFollow` | `boolean` | no | `false` | 親タブ追従 |
| `fallbackGroup` | `string` | no | unset | 非一致タブの移動先 |
| `shortcuts` | `object` | no | unset | ショートカット設定 |
| `rules` | `array` | yes | `[]` | ルール一覧 |
| `groups` | `object` | no | unset | グループ別の詳細設定 |

## `applyMode`

| Value | 意味 |
| --- | --- |
| `manual` | 手動実行時のみ適用 |
| `newTabs` | 新規タブ作成時に適用 |
| `always` | 定期評価で継続適用 |

補足:
- キー自体のデフォルト値は `manual`（未指定時）です。
- ただし、アプリ初期設定テンプレートは `newTabs` を採用しています（初期体験重視）。

## `rules[]`

| Key | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `pattern` | `string` | yes | - | マッチ対象 |
| `matchMode` | `regex \| glob` | no | `regex` | マッチ方式 |
| `group` | `string` | yes | - | 振り分け先グループ名 |
| `color` | `grey \| blue \| red \| yellow \| green \| pink \| purple \| cyan \| orange` | no | unset | Chromeのグループ色 |
| `priority` | `number` | no | YAML順で補完 | 競合時に高い値を優先 |

## regex / glob の違い

- `matchMode: regex`
  - `pattern` は JavaScript の正規表現文字列として扱う
  - `group` でキャプチャ参照が可能: `$1`, `$<name>`, `$$`
- `matchMode: glob`
  - `pattern` はワイルドカード（`*`）として扱う
  - `group` でキャプチャ参照は不可

## `groups`（詳細設定）

```yaml
groups:
  Search:
    ttlMinutes: 30
    maxTabs: 10
    lru: true
```

| Key | Type | Notes |
| --- | --- | --- |
| `ttlMinutes` | `number` | 指定時間経過で自動クリーンアップ対象 |
| `maxTabs` | `number` | 上限超過時にクリーンアップ |
| `lru` | `boolean` | 古いタブから優先して整理 |

## よくあるハマりどころ

- 期待URLが `fallbackGroup` に流れる:
  - `pattern` の書式と `matchMode` の組み合わせを確認する
  - `regex` の場合は先頭 `^` と末尾 `$` の条件が厳しすぎないか確認する
- 想定と違うグループに入る:
  - `priority` とルール順を見直す
- `group` でキャプチャが展開されない:
  - `matchMode: regex` かを確認する（globでは展開されない）

## 関連

- サンプル: `docs/config.sample.yml`
- 設定例集: `docs/examples.md`
