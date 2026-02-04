# Requirement

- [ ] Purpose / value: 最小のChrome拡張として起動し、YAML定義の単純ルールで手動整理できる状態を作る。
- [ ] Scope:
  - MV3拡張の土台（manifest/service worker/最小UI）
  - YAMLの最小スキーマ（rules: pattern -> group）
  - パターン評価（正規表現 or 部分一致の単純評価）
  - planner（pure）→ plan → executor の流れ
  - 手動実行UI（Popupの「今すぐ整理」など）
  - ユニットテスト（TDD）
- [ ] Out of scope:
  - 親子追従/外部フォールバック/優先度/変数展開
  - 自動適用モード
  - 自動整理（TTL/上限）
  - ショートカット
  - Options UIの高度機能
  - 診断API/CLI/E2E
- [ ] Assumptions:
  - 対象は既定で現在ウィンドウのタブ
  - YAMLは `chrome.storage.local` に保存
- [ ] Risks:
  - MV3のservice workerライフサイクルでUI/実行が切れる可能性
  - グループ操作権限の不足

# Acceptance Criteria

- [ ] AC1: 拡張をロードし、UIの「今すぐ整理」でタブが指定グループへ移動する。
- [ ] AC2: YAMLが無効な場合は実行せず、エラーを表示/ログする。
- [ ] AC3: plannerが純粋関数でplanを返し、ユニットテスト（TDD）が追加されている。
- [ ] AC4: executorが最小操作（create/move）を実行できる。

# Notes

- 
