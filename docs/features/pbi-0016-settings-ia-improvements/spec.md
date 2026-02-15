# Requirement

- [ ] Purpose / value: Settings を UI 編集中心の導線に寄せ、初期操作時の迷いを減らす。
- [ ] Scope:
  - Source/UI タブ順を `UI -> Source` に変更
  - 初期表示タブを `UI` に変更
  - `fallbackGroup` 編集UIを閉塞（YAML直編集のみ）
  - 新規ルール作成時の `matchMode` 既定を `glob` に変更
- [ ] Out of scope:
  - `matchMode` 未指定時の parser 既定値変更（互換影響があるため別PBI）
  - `groups.ttlMinutes/maxTabs/lru` のUI編集
- [ ] Assumptions:
  - YAML互換は維持し、`fallbackGroup` キー自体は引き続き読み書き可能
- [ ] Risks:
  - 初期タブ変更により既存ユーザーの操作習慣が変わる
  - UIから `fallbackGroup` が見えなくなることで機能発見性が下がる

# Acceptance Criteria

- [ ] AC1: Options 初期表示が `UI` タブになる。
- [ ] AC2: タブ並びが `UI` -> `Source` になる。
- [ ] AC3: `fallbackGroup` は UI から編集できない。
- [ ] AC4: 新規ルール作成時の `matchMode` 初期値が `glob` になる。
- [ ] AC5: 保存まで非反映、保存時のみ `chrome.storage.local` 反映の挙動を維持する。

# Notes

- `matchMode` の互換方針（UI default vs parser default）は PBI-0018 で最終確定する。
