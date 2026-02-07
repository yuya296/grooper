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

| 候補 | 基本コンポーネント | D&Dリスト標準提供 | 導入コスト（現行構成） | 所感 |
| --- | --- | --- | --- | --- |
| shadcn/ui | 強い（必要部品はほぼ揃う） | なし（追加実装前提） | 高（React化 + コンポーネント導入運用） | 見た目自由度は高い |
| Chakra UI | 強い（Form/Feedbackが厚い） | なし（追加実装前提） | 高（React化） | APIが分かりやすく実装速度が出る |
| MUI | 強い（実績/ドキュメント豊富） | 限定的（Transfer系はあるがSortable標準は弱い） | 高（React化） | 保守性は高いが見た目調整は設計必須 |

結論:
- 3候補とも「Sortable D&Dリストの完全標準提供」は弱い。
- D&D要件は `dnd-kit` など専用ライブラリ併用を前提に設計する。

## 4. 採用方針（設計時点）

- 第一候補: `Chakra UI + dnd-kit`
- 理由:
  - 必要な基本UIパーツが揃っており、状態に応じたエラー/通知設計がしやすい。
  - Optionsのフォーム中心UIと相性が良い。
  - D&Dは専用ライブラリ併用で実装責務を分離できる。
- 代替:
  - 見た目自由度最優先なら `shadcn/ui + dnd-kit`
  - 企業向け標準化重視なら `MUI + dnd-kit`

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
  - 各ルールをCard化
  - D&Dハンドルで並び替え
  - 追加/削除/複製を明示ボタン化

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
- AC3: 候補比較表と採用理由を本設計に記録
- AC4: `pnpm test`, `pnpm build` を通過
