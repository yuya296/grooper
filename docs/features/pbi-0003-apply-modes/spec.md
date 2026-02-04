# Requirement

- [ ] Purpose / value: 手動/新規タブのみ/常時自動の適用モードを切替え、運用に合わせた自動化を提供する。
- [ ] Scope:
  - YAMLでapplyModeを選択（manual/newTabs/always）
  - newTabs: tabs.onCreatedで適用
  - always: onCreated/onUpdated/onActivated + 低頻度スキャン
  - ユニットテスト（TDD）
- [ ] Out of scope:
  - 自動整理（TTL/上限）
  - Options UIの高度機能
  - 診断API/CLI/E2E
- [ ] Assumptions:
  - alwaysのスキャン間隔は最小限（パフォーマンス重視）
- [ ] Risks:
  - 過剰トリガーによる無限ループやパフォーマンス劣化

# Acceptance Criteria

- [ ] AC1: applyModeがmanualの場合、手動実行のみで動作する。
- [ ] AC2: applyModeがnewTabsの場合、新規タブのみ自動で整理される。
- [ ] AC3: applyModeがalwaysの場合、主要イベントで継続的に適用される。
- [ ] AC4: イベントごとのplan生成が決定的であることをテストで検証できる。
- [ ] AC5: ユニットテスト（TDD）が追加されている。

# Notes

- 
