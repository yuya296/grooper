# Design

## 1. ゴール

- Popupから設定画面へ1クリック遷移を提供する。
- Options UIをモダナイズしつつ、既存機能を維持する。
- D&Dリストを含む必要パーツの実装方針を先に固定する。

## 2. 必要パーツ（今回対象）

- Button
- Tabs
- Dialog / Alert
- Form controls（Input/Select/Switch）
- Toast / Inline Error
- Card / Panel
- D&Dで並び替え可能なリスト（Rules編集）

## 3. 候補比較（初期）

| 候補 | 基本コンポーネント | Sortable D&D実現性（実務） | 導入コスト（現行構成） | 所感 |
| --- | --- | --- | --- | --- |
| shadcn/ui | 強い（必要部品はほぼ揃う） | 高い（`@tanstack/react-table` + `dnd-kit` の実績構成） | 高（React化 + コンポーネント導入運用） | カスタム性が高く、テーブル/D&D要件と相性が良い |
| Chakra UI | 強い（Form/Feedbackが厚い） | 中（`dnd-kit` 併用で実現） | 高（React化） | APIは分かりやすいが、Data Grid系は追加選定が必要 |
| MUI | 強い（実績/ドキュメント豊富） | 中（DataGrid活用 + D&D追加実装） | 高（React化） | 保守性は高いが、デザイン統制コストが上がりやすい |

結論:
- 「ライブラリ単体の標準提供」ではなく「周辺エコシステム込みで短期実装できるか」を主評価軸にする。
- D&D要件は `dnd-kit` 併用前提で設計する。

## 4. 採用方針（設計時点）

- 第一候補: `shadcn/ui + @tanstack/react-table + dnd-kit`
- 理由:
  - Rules編集の本丸である「テーブル + Sortable D&D」を実績ある構成で組みやすい。
  - 必要部品を最小単位で導入でき、Options画面を段階移行しやすい。
  - 見た目の最終調整自由度が高く、モダナイズ要件に合わせやすい。
- 代替:
  - フォーム/フィードバック部品の即戦力を優先するなら `Chakra UI + dnd-kit`
  - 企業向け標準化重視なら `MUI + dnd-kit`
- 合意事項:
  - Rules一覧は shadcnベースのテーブルUIを採用する。
  - 行の並び替えは D&D を有効化する。
  - タイトルクリックで右サイドパネルを開き、項目詳細を編集できるようにする。

## 5. UI構成設計

### Popup

- Primary Action: `今すぐ整理`
- Secondary Action: `設定を開く`
- レイアウト: 上段タイトル、下段2ボタンの縦配置

### Options

- Header: タイトル + 保存/検証アクション
- Main:
  - 左: 設定ナビ（Source/UI/Advanced）
  - 右: 編集エリア
- Rules編集:
  - shadcnテーブルで一覧表示（列: Header/Section Type/Status/Target/Limit/Reviewer）
  - 先頭列にD&Dハンドルを配置し、ドラッグで優先順を変更
  - タイトルセルクリックで右サイドパネルを開く
  - サイドパネルで詳細編集（type/status/target/limit/reviewer 等）
  - 追加/削除/複製をテーブル上のアクションで提供

## 6. 技術設計（実装前提）

- 現行の `options.ts` / `popup.ts` はロジックを維持し、UI層のみ置換する。
- UI層は段階移行:
  1. Popup導線追加（既存DOM）
  2. Options画面をReact化し、既存ロジックをadapter経由で接続
  3. D&D領域を `dnd-kit` で置換
- ビルド:
  - esbuildエントリは維持しつつ、React JSXを許可する設定を追加

## 7. 受け入れ条件へのマッピング

- AC1: Popup Secondary Actionで `chrome.runtime.openOptionsPage()` 到達
- AC2: Options主要操作（Validate/Save/Preview/Rollback）を回帰維持
- AC3: 候補比較表と採用理由、Rules編集UI（テーブル+D&D+サイドパネル）を本設計に記録
- AC4: `pnpm test`, `pnpm build` を通過
