# Requirement

- [ ] Purpose / value: `groups` の運用ポリシー（color/ttlMinutes/maxTabs/lru）を UI から編集できるようにして、YAML直編集の負担を下げる。
- [ ] Scope:
  - Options UI に Group policies セクションを追加
  - `group`, `color`, `ttlMinutes`, `maxTabs`, `lru` を編集可能にする
  - YAML <-> UI の双方向同期（`parseYamlForUi` / `buildYamlFromUi`）
- [ ] Out of scope:
  - cleanupアルゴリズム本体の仕様変更
  - rule側colorとの競合ポリシーの再定義（既存仕様踏襲）
- [ ] Assumptions:
  - `groups` が空の場合は YAML 出力から `groups` を省略する
- [ ] Risks:
  - 数値入力のバリデーション不備による不正YAML生成

# Acceptance Criteria

- [ ] AC1: `groups` の各項目を UI で編集して保存できる。
- [ ] AC2: 再読み込み後に `groups` 設定が保持される。
- [ ] AC3: `pnpm test` / `pnpm build` が通る。

# Notes

- Group policy は YAML の `groups.<name>` へマップする。
