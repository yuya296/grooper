# Requirement

- [ ] Purpose / value: グループ単位の自動整理（TTL/上限/LRU）で放置タブを減らし安定運用する。
- [ ] Scope:
  - グループポリシー（ttlMinutes / maxTabs / lru）
  - 最終アクティブ時刻の記録
  - Clock抽象化（テストで時刻制御）
  - 自動整理のplan生成
  - ユニットテスト（TDD）
- [ ] Out of scope:
  - Options UIの高度機能
  - 診断API/CLI/E2E
- [ ] Assumptions:
  - 最終アクティブは tabs.onActivated 等から更新
- [ ] Risks:
  - 誤クローズの心理的コスト

# Acceptance Criteria

- [ ] AC1: ttlMinutesを超えたタブがplanでclose対象になる。
- [ ] AC2: maxTabs超過時にLRU順でclose対象になる。
- [ ] AC3: Clock抽象化により時間のテストが待ち時間ゼロで可能。
- [ ] AC4: ユニットテスト（TDD）が追加されている。

# Notes

- 
