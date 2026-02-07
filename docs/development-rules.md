# 開発ルール

## 原則
- YAMLがSSOT。UI/CLIはYAMLへ反映し、YAML手編集は再読み込みで反映する。
- ロジックは純粋関数化し、入力=(state, config, event, clock) → 出力=plan を守る。
- Chrome APIは薄いアダプタに限定し、副作用はplan executorのみで行う。
- 基本TDD。各PBIでユニットテストを必ず追加する。

## Definition of Done
- [ ] 主要ユースケースのユニットテストが追加されている（TDD）。
- [ ] planのスナップショット比較が更新されている。
- [ ] エッジケースが1つ以上テストされている。
- [ ] docsの仕様・前提が更新されている。
- [ ] `docs/progress.md` の状態と根拠が更新されている。

## コーディング指針
- 依存は最小限。YAMLパース/スキーマ検証は単一ライブラリで統一する。
- 時間依存はClock抽象化を経由し、テストで時刻を制御可能にする。
- 失敗はログに残し、UI/CLIには人間向けメッセージを返す。

## テスト運用
- `pnpm test` はユニット/スナップショット。
- `pnpm e2e` はPlaywright。
- 失敗時は plan/state/log を保存し、CIでアーティファクト化する。

## 進捗運用
- 進捗の正本は `docs/progress.md` とする。
- PBIの粒度進捗は `docs/features/pbi-xxxx-*/todo.md` に記録し、全体進捗は `docs/progress.md` へ集約する。
- コミットメッセージは `[PBI] prefix: ...` に合わせ、対応するPBI番号の進捗を更新する。
