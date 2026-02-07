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
  - 検証 / 保存
- タブ切替:
  - Source
  - UI

### Interaction constraints

- `Source -> UI` 切替時、YAMLパース失敗なら遷移しない
- エラー表示は常時視認できる位置
- 保存ボタンは「保存済みYAML」と現編集中YAMLの差分がある時のみ有効
- Source/UIどちらの編集も、保存ボタン押下まで永続化されない
- 未保存変更がある状態でタブ/ページ離脱時にブラウザ標準警告を表示
- 未保存状態が分かる文言をヘッダ付近に表示する

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
  - クリックで右ドロワーを「新規作成モード」で開く（一覧に即追加しない）

### UI constraints

- `fallbackGroup` は1行で崩れない
- `ルール追加` は右寄せ固定（モバイル時のみ自然折返し可）

## 5. Rules table

### Must (columns)

- Drag handle
- Group (クリックで詳細編集)
- Pattern
- Status (color)
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
- 必須入力: `Group Name`, `Pattern`
- 必須不足時は保存不可（保存ボタン無効）
- `Pattern` は正規表現バリデーションを行い、不正時は保存不可＋入力欄下にエラー表示
- 保存押下時にのみ新規行が一覧へ追加される（編集時も保存押下で反映）

### Must (open/close)

- Groupクリックで開く
- 背景クリックで閉じる
- `Esc` で閉じる
- `閉じる` ボタンで閉じる

## 7. Component policy (Shadcn/Radix based)

### Must

- ネイティブUIを避ける対象:
  - tabs, select, switch
- DnDは `dnd-kit` を利用

### Nice-to-have

- dialog/toast/table等の見た目もshadcnトークンに寄せる

## 8. Responsive and accessibility checkpoints

### Must

- 幅狭時に controls が重なって操作不能にならない
- キーボード操作で主要機能に到達できる
- コントラストを満たす（特に badge / muted text / overlay）

## 9. Non-goals

- ルール評価ロジックの変更
- 追加設定項目の導入
- 診断API/CLI機能追加
