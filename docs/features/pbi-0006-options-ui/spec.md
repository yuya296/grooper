# Requirement

- [ ] Purpose / value: YAML SSOTを保ちつつ、安全に設定編集できるUIを提供する。
- [ ] Scope:
  - OptionsページでのYAML編集
  - インポート/エクスポート（貼り付け/コピー）
  - バリデーション（必須キー、型、未知キー、変数参照、パターン形式）
  - エラー箇所の明示
  - ユニットテスト（TDD）
- [ ] Out of scope:
  - 反映前プレビュー
  - 変更履歴/バックアップ
  - 診断API/CLI/E2E
- [ ] Assumptions:
  - YAMLが常に正（UIはYAMLへ反映するだけ）
- [ ] Risks:
  - 大きなYAMLでの編集体験劣化

# Acceptance Criteria

- [ ] AC1: OptionsページでYAMLを編集し保存できる。
- [ ] AC2: バリデーションでエラー箇所が表示される。
- [ ] AC3: インポート/エクスポートができる。
- [ ] AC4: 検証ロジックにユニットテスト（TDD）がある。

# Notes

- 
