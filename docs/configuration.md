# Configuration Reference

Grooper の設定は YAML で管理します。現行は **`version: 2` 固定**です。

## 初期プリセット（インストール直後）

- `applyMode: newTabs`
- `groupingStrategy: inheritFirst`
- `groups[].rules[]` で `Work / Docs / Search / Media / Social` を分類
- 非一致タブは移動しない（fallback機能なし）

正本: `docs/config.sample.yml`

## 最小構成

```yaml
version: 2
applyMode: manual
groupingStrategy: inheritFirst
groups:
  - name: Example
    rules:
      - pattern: '*example.com*'
```

## ルートキー

| Key | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `version` | `number` | yes | `2` | 現在は `2` 固定 |
| `applyMode` | `manual \| newTabs \| always` | no | `manual` | 適用タイミング |
| `groupingStrategy` | `inheritFirst \| ruleFirst \| ruleOnly` | no | `inheritFirst` | 親継承とルール一致の評価順 |
| `vars` | `object` | no | `{}` | `pattern` 内 `${name}` 展開用 |
| `shortcuts` | `object` | no | unset | ショートカット設定 |
| `groups` | `array` | yes | `[]` | グループ定義（`name/color/cleanup/rules`） |

## `applyMode`

| Value | 意味 |
| --- | --- |
| `manual` | 手動実行時のみ適用 |
| `newTabs` | 新規タブ作成時に適用 |
| `always` | 定期評価で継続適用 |

## `groupingStrategy`

| Value | 意味 |
| --- | --- |
| `inheritFirst` | 親タブ継承を先に評価し、未決定ならルール評価 |
| `ruleFirst` | ルール評価を先に実施し、未決定なら親継承 |
| `ruleOnly` | ルールのみ評価（親継承しない） |

## `groups[]`

```yaml
groups:
  - name: Work
    color: blue
    cleanup:
      ttlMinutes: 30
      maxTabs: 10
      lru: true
    rules:
      - pattern: '*github.com*'
        matchMode: glob
```

| Key | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `name` | `string` | yes | - | グループ名 |
| `color` | `grey \| blue \| red \| yellow \| green \| pink \| purple \| cyan \| orange` | no | unset | Chrome/Edge のグループ色 |
| `cleanup.ttlMinutes` | `number` | no | unset | 指定時間経過で自動クリーンアップ対象 |
| `cleanup.maxTabs` | `number` | no | unset | 上限超過時にクリーンアップ |
| `cleanup.lru` | `boolean` | no | unset | 古いタブから優先して整理 |
| `rules` | `array` | yes | `[]` | グループ内ルール |

## `groups[].rules[]`

| Key | Type | Required | Default | Notes |
| --- | --- | --- | --- | --- |
| `pattern` | `string` | yes | - | マッチ対象 |
| `matchMode` | `regex \| glob` | no | `glob` | マッチ方式 |

## 評価順

1. `groupingStrategy` に従って「親継承」と「ルール一致」の先後を決める
2. ルール評価時は **YAML順のみ**で判定（`groups` の順 → 各 `rules` の順）
3. 非一致タブは no-op（移動しない）

## Dynamic Group Name（閉塞仕様）

- `$1`, `$<name>`, `$$` は展開しません。
- 文字列に含まれていてもそのままリテラルとして扱います。
- エラーにはしません。

## 破壊的変更ポイント（v1 → v2）

- top-level `rules[]` は廃止
- `fallbackGroup` は廃止
- `priority` は廃止
- `parentFollow + groupingPriority` は `groupingStrategy` に統合
- 旧 `version: 1` は parse error

## 関連

- サンプル: `docs/config.sample.yml`
- 設定例集: `docs/examples.md`
