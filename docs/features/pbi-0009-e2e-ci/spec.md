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

- E2E/CI運用メモ:
  1. `pnpm test` はVitestユニットテストのみを実行し、`tests/e2e`は対象外にする。
  2. `pnpm e2e` はPlaywrightで実行し、失敗時に`trace/screenshot/video`を`test-results`へ保存する。
  3. E2Eシナリオ失敗時は診断API経由で`state/plan/log`をJSON保存し、Playwright attachmentとして紐づける。
  4. CIの`e2e`ジョブ失敗時は`test-results/**`と`playwright-report/**`をartifactとして収集する。
