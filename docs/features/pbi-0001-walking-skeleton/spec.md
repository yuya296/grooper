# Requirement

- [ ] Purpose / value: 最小のChrome拡張として起動し、YAML定義の単純ルールで手動整理できる状態を作る。
- [ ] Scope:
  - MV3拡張の土台（manifest/service worker/最小UI）
  - YAMLの最小スキーマ（version/applyMode/rules）
    - version: 1
    - applyMode: manual（省略時はmanual）
    - rules: [{ pattern, group, color? }]
  - パターン評価（ECMAScript regex、対象はtab.url全文、先頭一致は正規表現で表現）
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
  - 対象は既定で現在ウィンドウの全タブ（tab.urlがあるもの）
  - ルールは上から評価し、最初にマッチしたものを採用
  - 手動実行の対象範囲は「現在ウィンドウのみ」
  - グループはtitle一致なら再利用し、color指定があれば更新する
  - 無効な正規表現はバリデーションエラーとして実行しない
  - YAMLは `chrome.storage.local` に保存
- [ ] Risks:
  - MV3のservice workerライフサイクルでUI/実行が切れる可能性
  - グループ操作権限の不足

# Acceptance Criteria

- [ ] AC1: 拡張をロードし、UIの「今すぐ整理」でタブが指定グループへ移動する。
- [ ] AC2: YAMLが無効な場合は実行せず、エラーを表示/ログする。
- [ ] AC3: plannerが純粋関数でplanを返し、ユニットテスト（TDD）が追加されている。
- [ ] AC4: executorが最小操作（create/move）を実行できる。
- [ ] AC5: パターンはtab.url全文に対する正規表現で評価される。

# Notes

- 初期スキーマは最小限に留め、以降のPBIで拡張する。
