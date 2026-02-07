# UI Functional Requirements (for Figma Make relayout)

## Scope

- 対象画面: `popup`, `options`
- 目的: レイアウト再生成時に、現在の機能を欠落させないための要件固定

## 1. Popup

### Must

- `今すぐ整理` ボタン
  - クリックで手動実行
  - 実行状態/エラー/完了をステータス表示
- `設定を開く` ボタン
  - クリックで options 画面へ遷移

### UI Notes

- 2ボタンは縦積み
- ステータス領域は1行以上を確保（レイアウトジャンプ防止）

## 2. Options: Global layout

### Must

- ヘッダアクション群:
  - 検証 / 保存 / エクスポート / インポート / プレビュー / ロールバック
- タブ切替:
  - Source
  - UI

### Interaction constraints

- `Source -> UI` 切替時、YAMLパース失敗なら遷移しない
- エラー表示は常時視認できる位置

## 3. Source tab

### Must

- YAML textarea 編集
- YAML内容をそのまま保存対象にする

## 4. UI tab: Settings row

### Must

- `applyMode` 選択
  - `manual / newTabs / always`
- `fallbackGroup` 設定
  - 有効/無効トグル
  - 有効時のみ GroupName 入力可
- `ルール追加` ボタン（右寄せ）

### UI constraints

- `fallbackGroup` は1行で崩れない
- `ルール追加` は右寄せ固定（モバイル時のみ自然折返し可）

## 5. Rules table

### Must (columns)

- Drag handle
- Group (クリックで詳細編集)
- Pattern
- Status (color)
- Target (priority)
- Row action (削除)

### Must (DnD behavior)

- ハンドルドラッグで並び替え
- 挿入先ハイライト表示
- ドラッグ中オーバーレイがカーソル追従

## 6. Rule detail drawer (right slide panel)

### Must

- Group Name
- Pattern
- Status (color)
  - Chrome tab group 対応色のみ選択可能
  - 選択肢: `none, grey, blue, red, yellow, green, pink, purple, cyan, orange`
  - 項目内に色ドット表示
- Target (priority)

### Must (open/close)

- Groupクリックで開く
- 背景クリックで閉じる
- `Esc` で閉じる
- `閉じる` ボタンで閉じる

## 7. Preview / History

### Must

- Previewエリア
  - プレビュー結果テキスト表示
  - 未実行時のプレースホルダ表示
- Historyエリア
  - 履歴時刻一覧表示
  - 空状態表示

## 8. Component policy (Shadcn/Radix based)

### Must

- ネイティブUIを避ける対象:
  - tabs, select, switch
- DnDは `dnd-kit` を利用

### Nice-to-have

- dialog/toast/table等の見た目もshadcnトークンに寄せる

## 9. Responsive and accessibility checkpoints

### Must

- 幅狭時に controls が重なって操作不能にならない
- キーボード操作で主要機能に到達できる
- コントラストを満たす（特に badge / muted text / overlay）

## 10. Non-goals

- ルール評価ロジックの変更
- 追加設定項目の導入
- 診断API/CLI機能追加
