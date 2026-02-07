# 設定例（YAML）

このドキュメントは、ユースケース別にそのまま貼り付けて使える設定例です。  
基本形は `docs/config.sample.yml` を参照してください。

## 1. example.com の1階層目でグルーピング（regexキャプチャ）

```yaml
version: 1
applyMode: manual
parentFollow: true
fallbackGroup: "Fallback"
rules:
  - pattern: '^https?://example\\.com/(?<env>[^/]+)(?:/.*)?$'
    matchMode: regex
    group: 'Example:$<env>'
    color: "blue"
    priority: 10
```

動作イメージ:
- `https://example.com/hoge/` -> `Example:hoge`
- `https://example.com/hoge/foo` -> `Example:hoge`
- `https://example.com/fuga/aaa` -> `Example:fuga`

## 2. シンプルなglobマッチ（固定グループ）

```yaml
version: 1
applyMode: manual
fallbackGroup: "Fallback"
rules:
  - pattern: '*google.com/search*'
    matchMode: glob
    group: "Search"
    color: "red"
    priority: 5
  - pattern: '*example.org*'
    matchMode: glob
    group: "ExampleOrg"
    priority: 1
```

## メモ

- `matchMode: regex` のとき、`group` で `$1` / `$<name>` / `$$` が使えます。
- `matchMode: glob` のとき、`group` でキャプチャ参照（`$1`, `$<name>`）は使えません。
- `${var}` は `vars` の固定値展開です（キャプチャ参照とは別）。
