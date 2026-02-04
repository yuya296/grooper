# PBI分割方針

## 基本方針
- ユーザー価値の出る「垂直スライス」を最優先にする（UI/ロジック/ストレージをまたぐ薄い縦切り）。
- PBIはINVESTの観点で最小化し、独立性・価値・小ささ・テスト可能性を重視する。
- 初手はWalking Skeletonで、最小のE2Eを成立させ統合リスクを早期に下げる。
- 並び順は価値・リスク・依存関係を総合的に見て「順序付け」する。

## このプロジェクトでの適用
1. Walking Skeletonで最小の拡張を動かし、コアの技術スタックを固定する。
2. 価値の中心（振り分け精度・自動化）を先に立ち上げる。
3. 運用性（ショートカット、Options UI）を後段で追加する。
4. 診断API/CLI/E2E/CIは品質と検証効率のために独立PBIとする。

## 参考
- Agile Alliance: Vertical sliceの説明
  - https://agilealliance.org/resources/experience-reports/a-tale-of-slicing-and-imagination/
- Agile Alliance: INVESTの定義
  - https://agilealliance.org/glossary/invest/
- Forbes: Walking Skeletonの概要
  - https://www.forbes.com/councils/forbestechcouncil/2020/01/02/using-a-walking-skeleton-to-reduce-risk-in-software-innovation/
- Scrum.org: バックログ順序付けの考え方
  - https://www.scrum.org/resources/ordering-product-backlog
