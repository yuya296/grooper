# Test Strategy

## Goal

- [ ] CLI/診断APIでの自動検証が可能であることを確認

## Preconditions

- [ ] 拡張がロードされ、診断APIが有効

## CLI Checks

- [ ] Command: tabgrouper plan --config config.yml --state fixtures/state.json
  - Expected: plan.jsonが生成される
- [ ] Command: tabgrouper snapshot --out state.json
  - Expected: 現在状態がJSONで取得できる

## Browser Checks

- [ ] URL / Screen: 診断API経由
  - Steps:
    - runOnce(dryRun)
    - getState/getLogs
  - Expected:
    - planのみ返り、状態とログが取得できる

## Edge Cases

- [ ] 無効なYAMLをsetConfigした場合のエラー
- [ ] 診断APIが無効な環境での拒否動作
