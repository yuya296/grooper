# Requirement

- [ ] Purpose / value: 実ブラウザでの自動検証とCIでの品質ゲートを整備する。
- [ ] Scope:
  - Playwright E2E（パターン/親子/外部起点/モード/自動整理）
  - CIで `pnpm test` → `pnpm e2e` の実行
  - 失敗時のplan/state/logアーティファクト化
  - テストユーティリティのユニットテスト（TDD）
- [ ] Out of scope:
  - 追加の新機能実装
- [ ] Assumptions:
  - Headless Chromeで拡張のロードが可能
- [ ] Risks:
  - E2Eの不安定性（タイミング依存）

# Acceptance Criteria

- [ ] AC1: 主要シナリオのE2EがPlaywrightで自動実行できる。
- [ ] AC2: CIでユニット→E2Eの順で実行される。
- [ ] AC3: 失敗時にplan/state/logが取得できる。
- [ ] AC4: テストユーティリティにユニットテスト（TDD）がある。

# Notes

- 
