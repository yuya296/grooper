## ルール
- 人間への確認は最小限にして。
- こまめにcommitはしておいて。
- commitメッセージは `[XXXX] feat: ....` みたいな感じで。
  - XXXXはPBI番号
  - prefixは feat, fix, refactor, docs, chore など。
- feature開発のtodoは `docs/features/pbi-xxxx-*/todo.md` 
  - 対応することが増えた場合はチェックリストを都度追加する
  - 対応が完了したタスクは都度チェックする
  - なるべくソースコードの修正と同じコミットでtodo.mdを更新する

## ドキュメント配置
- 全体設計: `docs/architecture.md`
- 開発ルール/DoD: `docs/development-rules.md`
- 進捗管理（正本）: `docs/progress.md`
- PBI一覧（優先度・依存・進捗）: `docs/features/overview.md`
- PBI詳細: `docs/features/pbi-xxxx-*/spec.md`
- PBIタスク: `docs/features/pbi-xxxx-*/todo.md`
- PBIテスト計画: `docs/features/pbi-xxxx-*/test.md`
- 設定サンプルYAML: `docs/config.sample.yml`

## UIテスト用 localhost 起動手順
- 目的: 拡張を読み込まずに `Options/Popup` のUIだけをブラウザで確認する。
- 手順:
  1. `pnpm build`
  2. `python3 -m http.server 4173 -d dist/extension`
  3. ブラウザで以下を開く
     - `http://localhost:4173/options.html`
     - `http://localhost:4173/popup.html`
- 補足:
  - これはUI確認用。`chrome.*` API依存の動作はローカル配信では一部制限される。
