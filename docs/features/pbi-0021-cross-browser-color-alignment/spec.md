# Requirement

- [ ] Purpose / value: Chrome/Edge の色差分で `tabGroups.update` が失敗しても、グルーピング自体が止まらないようにする。
- [ ] Scope:
  - 色定義を共通化（UIとexecutorで共通利用）
  - `tabGroups.update` の色適用失敗時に色なし更新へフォールバック
  - ログ出力で追跡可能にする
- [ ] Out of scope:
  - ブラウザ別に色候補を動的出し分けするUI
- [ ] Assumptions:
  - 既定色セットは Chrome ColorEnum 準拠の9色を採用
- [ ] Risks:
  - 環境依存の失敗はユニットテストで完全再現できない

# Acceptance Criteria

- [ ] AC1: 色定義が単一ソースで管理される。
- [ ] AC2: 色適用に失敗してもグループ作成/移動は継続する。
- [ ] AC3: `pnpm test` / `pnpm build` が通る。

# Notes

- 実ブラウザでの最終確認は手動チェックで行う。
