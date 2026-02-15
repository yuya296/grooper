# Requirement

- [ ] Purpose / value: ルール評価の「並び順」と「優先度」の仕様を一本化し、実装・ドキュメント・運用の解釈ズレをなくす。
- [ ] Scope:
  - 評価順（parentFollow / pattern / fallback）を明文化
  - pattern競合時の優先（`priority` 降順→同値はYAML順）を明文化
  - UI並び替えと `priority` 自動採番の関係を明文化
  - `matchMode` の parser既定値と UI新規作成既定値の差を明文化
- [ ] Out of scope:
  - planner の判定順ロジック変更
  - `priority` フィールド廃止
- [ ] Assumptions:
  - 既存ユーザー互換性を優先し、parser既定値は当面 `regex` を維持する
- [ ] Risks:
  - 仕様が複数箇所に分散すると再び不整合が発生する

# Acceptance Criteria

- [ ] AC1: `docs/configuration.md` に優先順位仕様が明記される。
- [ ] AC2: `docs/architecture.md` に planner評価順の仕様が明記される。
- [ ] AC3: `matchMode` の default（parser/UI）の差分が明記される。

# Notes

- 実装変更を伴う場合は後続PBI（0019/0020）で取り扱う。
