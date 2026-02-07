# Requirement

- [ ] Purpose / value: Popup/Optionsのダークモード対応により、視認性と長時間利用時の快適性を改善する。
- [ ] Scope:
  - Popup/Options のテーマ切替（`light` / `dark` / `system`）
  - 設定値の永続化と起動時反映
  - 既存UIコンポーネント（table/select/switch/drawer/toast）のダーク配色対応
  - コントラストを維持した配色トークン整理
- [ ] Out of scope:
  - 新しい画面追加
  - コンテンツ文言そのものの改修
- [ ] Assumptions:
  - shadcn/Radixベースのトークン調整で対応可能
  - 既定値は `system`
- [ ] Risks:
  - 一部コンポーネントのコントラスト不足
  - テーマ切替時のちらつき

# Acceptance Criteria

- [ ] AC1: ユーザーが `light` / `dark` / `system` を選択でき、保存後も再現される。
- [ ] AC2: Popup/Optionsの主要UIでダークモード時に可読性が維持される。
- [ ] AC3: 既存機能（保存/D&D/ドロワー/トースト）に機能劣化がない。

# Notes

- まずはOptions中心に整備し、Popupも同じトークンで追従させる。
