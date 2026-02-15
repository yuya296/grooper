## Context
PBI-0022 で「Chakra UIを導入するか」を再評価した。現行の Options UI は `shadcn系 + Radix + TanStack Table + dnd-kit` で構築済みで、PBI-0016〜0021 でも同基盤を前提に改善を進めている。

## Options considered
- `現行維持（shadcn系 + Radix）` - 既存実装との整合性が高く、回帰リスクを最小化できる。
- `ハイブリッド導入（部分的にChakra）` - 局所的な実装速度は上がる可能性があるが、デザイン/コンポーネント運用が二重化する。
- `全面移行（Chakraへ統一）` - 長期的な統一は見込めるが、短期の移行コストと回帰検証コストが大きい。

## Decision
当面は `現行維持（shadcn系 + Radix）` を継続し、Chakra への移行は実施しない。

## Consequences
- 既存UIの保守・改善を継続しやすい。
- デザインシステムの二重管理を回避できる。
- Chakra導入が必要になった場合は、対象画面を限定した別PBIで再評価する。

## References
- docs/adr/ADR-1-adopt-shadcn-tanstack-dndkit-for-options-rules-ui.md
- docs/features/pbi-0022-chakra-re-evaluation/spec.md
