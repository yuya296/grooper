# Configuration Examples

目的別にすぐ使える設定例です。  
基本形は `docs/config.sample.yml` を参照してください。

## 1. Default preset（初期状態）

```yaml
version: 1
applyMode: newTabs
parentFollow: false
rules:
  - pattern: '*github.com*'
    matchMode: glob
    group: "Work"
    color: "blue"
    priority: 100
  - pattern: '*docs.google.com*'
    matchMode: glob
    group: "Docs"
    color: "green"
    priority: 90
  - pattern: '*google.*/search*'
    matchMode: glob
    group: "Search"
    color: "red"
    priority: 80
  - pattern: '*youtube.com*'
    matchMode: glob
    group: "Media"
    color: "purple"
    priority: 70
```

すぐ試せるURL:
- `https://github.com/`
- `https://docs.google.com/`
- `https://www.google.com/search?q=grooper`
- `https://www.youtube.com/`

## 2. example.com の1階層目でグルーピング（regexキャプチャ）

```yaml
version: 1
applyMode: manual
parentFollow: false
rules:
  - pattern: '^https?://example\.com/(?<env>[^/]+)(?:/.*)?$'
    matchMode: regex
    group: 'Example:$<env>'
    color: "blue"
    priority: 10
```

動作イメージ:
- `https://example.com/hoge/` -> `Example:hoge`
- `https://example.com/hoge/foo` -> `Example:hoge`
- `https://example.com/fuga/aaa` -> `Example:fuga`

## 3. シンプルなglobマッチ（固定グループ）

```yaml
version: 1
applyMode: manual
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

## 4. fallbackGroup を使う

```yaml
version: 1
applyMode: newTabs
fallbackGroup: "Fallback"
rules:
  - pattern: '*docs.google.com*'
    matchMode: glob
    group: "Docs"
    color: "green"
```

一致しないURLは `Fallback` にまとめられます。

## 5. always + groupsで自動整理強化

```yaml
version: 1
applyMode: always
rules:
  - pattern: '*github.com*'
    matchMode: glob
    group: "Dev"
    color: "blue"
groups:
  Dev:
    ttlMinutes: 120
    maxTabs: 20
    lru: true
```

## メモ

- `matchMode: regex` のとき、`group` で `$1` / `$<name>` / `$$` が使えます。
- `matchMode: glob` のとき、`group` でキャプチャ参照（`$1`, `$<name>`）は使えません。
- `${var}` は `vars` の固定値展開です（キャプチャ参照とは別）。
