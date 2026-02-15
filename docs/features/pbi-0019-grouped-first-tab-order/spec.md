# Requirement

- [ ] Purpose / value: タブ表示の視認性を高めるため、同一ウィンドウ内で `grouped > ungrouped` の並びを維持する。
- [ ] Scope:
  - grouped-first 並び順を計算する純粋関数を追加
  - plan実行後（moveTabを含む場合）に grouped-first へ整列
  - ショートカット操作（group/ungroup）後にも整列
- [ ] Out of scope:
  - グループ間の並び順ルール変更
  - pinned タブの挙動変更
- [ ] Assumptions:
  - pinned タブは先頭領域を維持し、非pinned領域のみ整列対象とする
- [ ] Risks:
  - `chrome.tabs.move` 多用によるUIチラつき

# Acceptance Criteria

- [ ] AC1: grouped と ungrouped が混在した場合、非pinned領域で grouped が先に並ぶ。
- [ ] AC2: grouped 内/ungrouped 内の相対順は維持される。
- [ ] AC3: `pnpm test` / `pnpm build` が通る。

# Notes

- 並び替えは move が発生した window に限定して実行する。
