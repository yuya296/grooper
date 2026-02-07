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

- 設定編集フロー（手動確認手順）:
  1. Optionsを開き、`Source`タブで現在のYAMLを読み込む。
  2. YAMLを編集して`Validate`を実行し、エラーがあれば行番号付きメッセージを確認する。
  3. エラー解消後に`Save`で保存し、再読込して内容が維持されることを確認する。
  4. `Import`で外部YAMLを貼り付けて取り込み、同じく検証と保存を行う。
  5. `Export`で現在設定を出力し、再インポートできることを確認する。
  6. `UI`タブへ切替え、`applyMode/rules/fallbackGroup`の編集がYAML表示へ同期されることを確認する。
