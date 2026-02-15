# Test Strategy

## Goal

- [ ] UI中心導線への変更が既存保存フローを壊さないことを確認する

## CLI Checks

- [ ] Command: `pnpm test`
  - Expected: 既存ユニットテストが全通過
- [ ] Command: `pnpm build`
  - Expected: 拡張ビルドが成功する

## Browser Checks

- [ ] URL / Screen: `http://localhost:4173/options.html`
  - Steps: 画面表示直後の選択タブを確認
  - Expected: UIタブが初期選択されている
- [ ] URL / Screen: `http://localhost:4173/options.html`
  - Steps: タブ見出し順を確認
  - Expected: 左から `UI`, `Source` の順
- [ ] URL / Screen: `http://localhost:4173/options.html`
  - Steps: 基本設定エリアに fallbackGroup 編集UIが存在しないことを確認
  - Expected: fallbackGroup のトグル/入力が表示されない
- [ ] URL / Screen: `http://localhost:4173/options.html`
  - Steps: ルール追加ドロワーを開き、初期matchModeを確認
  - Expected: `wildcard (glob)` が初期選択
