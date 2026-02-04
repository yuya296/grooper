# Requirement

- [ ] Purpose / value: キーボード操作でグループ移動や解除ができ、作業効率が上がる。
- [ ] Scope:
  - Chrome commands を使ったショートカット
  - 次/前のグループへ移動、グループ解除
  - 任意グループへの移動（YAMLでマッピング）
  - ユニットテスト（TDD）
- [ ] Out of scope:
  - Options UIの高度機能
  - Options UIでのショートカット設定
  - 診断API/CLI/E2E
- [ ] Assumptions:
  - 実際のキー割り当ては chrome://extensions/shortcuts で行う
- [ ] Risks:
  - グループ順序の解釈がユーザー期待とずれる可能性

# Acceptance Criteria

- [ ] AC1: 次/前のグループへタブ移動できる。
- [ ] AC2: 任意グループへ移動できる（YAMLマッピング）。
- [ ] AC3: グループ解除ができる。
- [ ] AC4: ショートカットの解釈ロジックにユニットテスト（TDD）がある。

# Notes

- 
