# Configuration Examples

目的別にすぐ使える設定例です。  
基本形は `docs/config.sample.yml` を参照してください。

## 1. Default preset（初期状態）

```yaml
version: 2
applyMode: newTabs
groupingStrategy: inheritFirst
groups:
  - name: Work
    color: blue
    rules:
      - pattern: '*github.com*'
  - name: Docs
    color: green
    rules:
      - pattern: '*docs.google.com*'
  - name: Search
    color: red
    rules:
      - pattern: '*google.*/search*'
```

## 2. 親継承を使わずルールのみ適用

```yaml
version: 2
applyMode: manual
groupingStrategy: ruleOnly
groups:
  - name: Search
    color: red
    rules:
      - pattern: '*google.com/search*'
      - pattern: '*duckduckgo.com/*'
```

## 3. regexを使う例（グループ名は固定）

```yaml
version: 2
applyMode: manual
groups:
  - name: ExampleEnv
    color: cyan
    rules:
      - pattern: '^https?://example\.com/(?<env>[^/]+)(?:/.*)?$'
        matchMode: regex
```

メモ: `dynamic group name` は閉塞中のため、`$1` / `$<name>` は展開されません。

## 4. cleanup を使う

```yaml
version: 2
applyMode: always
groupingStrategy: inheritFirst
groups:
  - name: Dev
    color: blue
    cleanup:
      ttlMinutes: 120
      maxTabs: 20
      lru: true
    rules:
      - pattern: '*github.com*'
      - pattern: '*gitlab.com*'
```

## 5. `$1` を含む名前をリテラルで使う

```yaml
version: 2
applyMode: manual
groups:
  - name: 'Team-$1'
    color: yellow
    rules:
      - pattern: '*example.com*'
```

この場合、実際のグループ名は `Team-$1` のままです。
