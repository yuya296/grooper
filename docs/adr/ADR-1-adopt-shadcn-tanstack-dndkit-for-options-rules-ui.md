## Context
PBI-0010でOptions UIをモダナイズするにあたり、Rules編集UIにはテーブル表示、行の並び替え（D&D）、タイトルクリックでのサイドパネル詳細編集が必要になった。  
既存実装はプレーンDOM中心であり、将来的な拡張性と実装速度のバランスを取るライブラリ構成を先に確定する必要がある。

## Options considered
- `shadcn/ui + @tanstack/react-table + dnd-kit` - テーブル/D&Dの実績構成を取りやすく、見た目と操作性の自由度が高い。一方でReact化と初期セットアップのコストはある。
- `Chakra UI + dnd-kit` - フォーム系部品と状態表示が強く実装は進めやすいが、テーブル体験は追加設計の比重が上がる。
- `MUI (+ DataGrid) + dnd-kit` - 実績と保守性は高いが、今回のデザイン調整や軽量なカスタム性の面でコストが増えやすい。

## Decision
Rules編集UIは `shadcn/ui + @tanstack/react-table + dnd-kit` を採用する。  
理由は、要求されたテーブル中心UIとD&D体験を最短で実現しやすく、かつサイドパネル編集を含むUI拡張に柔軟に対応できるため。

## Consequences
- Options画面は段階的にReact化する必要がある。
- UIレイヤーの実装速度と拡張性は上がる一方、導入初期の学習・セットアップコストが発生する。
- D&D挙動、キーボード操作、アクセシビリティについて追加検証が必要になる。
- この決定により、PBI-0010の実装タスクは「テーブル + D&D + サイドパネル」を前提に進行する。

## References
- https://ui.shadcn.com/docs/components/data-table
- https://ui.shadcn.com/docs/components/table
- https://ui.shadcn.com/examples/dashboard
- docs/features/pbi-0010-popup-settings-modernize/design.md
