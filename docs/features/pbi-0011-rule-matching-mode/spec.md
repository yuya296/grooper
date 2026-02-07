# Requirement

- [ ] Purpose / value: ルールのマッチ方法を正規表現だけでなくワイルドカード（glob）でも指定できるようにし、設定難易度を下げる。
- [ ] Scope:
  - `rules[].matchMode` を追加（`regex` / `glob`）
  - `matchMode=glob` のときワイルドカードパターンを実行時マッチへ変換して評価
  - 既存YAML互換性維持（未指定時は `regex` 扱い）
  - Options UI（テーブル/ドロワー）に `matchMode` 選択UIを追加
  - モード別バリデーション（regex構文チェック、globの基本妥当性チェック）
- [ ] Out of scope:
  - 新しい演算子や高度なDSLの追加
  - URL以外（title等）へのマッチ対象拡張
- [ ] Assumptions:
  - glob仕様は最小セット（`*`, `?`）から開始する
  - 内部評価は最終的に `RegExp` へ正規化して扱う
- [ ] Risks:
  - regex/globの期待差による誤設定
  - 互換維持漏れによる既存設定の挙動変化

# Acceptance Criteria

- [ ] AC1: 既存YAML（`matchMode` なし）は従来通り正規表現として評価される。
- [ ] AC2: UI/Sourceの双方で `matchMode` を `regex` / `glob` から選択・保存できる。
- [ ] AC3: `glob` 指定ルールで期待通りにマッチし、主要ケースのテストが追加される。

# Notes

- 初期のglob仕様はMVPとして最小化し、必要に応じて後続PBIで拡張する。
