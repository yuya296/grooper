# Requirement

- [ ] Purpose / value: CLI/診断APIで自動検証が可能になり、AI/CI運用が回る。
- [ ] Scope:
  - `__diag__` 名前空間の診断API
  - コマンド: getState, runOnce, setConfig, getConfig, reset, getLogs
  - CLI: plan/apply/snapshot/verify
  - dry-run（planのみ生成）
  - ユニットテスト（TDD）
- [ ] Out of scope:
  - Playwright E2E/CI
- [ ] Assumptions:
  - 診断APIは開発/CI時のみ有効
- [ ] Risks:
  - 認可不足で本番に露出するリスク

# Acceptance Criteria

- [ ] AC1: 診断APIで状態取得/手動実行/設定操作/ログ取得ができる。
- [ ] AC2: CLIでplan/apply/snapshot/verifyが実行できる。
- [ ] AC3: dry-runがplanだけを返す。
- [ ] AC4: CLI/診断APIのロジックにユニットテスト（TDD）がある。

# Notes

- CLI/診断API運用メモ:
  1. 設定投入は`setConfig`→`runOnce(dryRun: true)`→`runOnce(dryRun: false)`の順で実行する。
  2. `getState/getLogs`で適用結果と実行ログを採取し、検証は`verify`コマンドでplan一致を判定する。
  3. CI/自動検証では`plan/apply/snapshot/verify`のみを公開経路として扱う。
