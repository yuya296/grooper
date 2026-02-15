# Tasks

- [x] 設計: 優先順位概念（YAML順/UI順/priority/適用順）を整理
- [x] docs更新: `configuration.md` に評価順とdefault方針を明記
- [x] docs更新: `architecture.md` に planner評価順を明記
- [x] docs更新: PBI-0018のspec/todo/testを追加

# Updates

- 2026-02-15: PBI-0018 着手。Issue #7 の論点を仕様観点で分解。
- 2026-02-15: 評価順を「parentFollow -> pattern(priority/YAML順) -> fallback」として明文化。
- 2026-02-15: `matchMode` は parser既定=`regex`、UI新規既定=`glob` を併記。
