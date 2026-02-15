export type Locale = 'ja' | 'en';

export const LANGUAGE_KEY = 'language';
export const DEFAULT_LOCALE: Locale = 'ja';

const MESSAGES: Record<Locale, Record<string, string>> = {
  ja: {
    'common.source': 'Source',
    'common.ui': 'UI',
    'common.save': '保存',
    'common.close': '閉じる',
    'common.validate': '検証',
    'common.none': 'none',
    'language.label': '言語',
    'language.ja': '日本語',
    'language.en': 'English',
    'popup.title': 'Grooper — Rule-based tab grouping',
    'popup.runNow': '今すぐ整理',
    'popup.openSettings': '設定を開く',
    'popup.running': '実行中...',
    'popup.done': '完了',
    'popup.error': 'エラー: {message}',
    'popup.failed': '失敗: {errors}',
    'popup.unknownError': 'unknown error',
    'options.title': '設定',
    'options.themeToggle': 'テーマ切替',
    'options.saveHintDirty': '未保存の変更があります（保存するまで設定は反映されません）',
    'options.saveHintClean': '保存済み',
    'options.reset': 'デフォルトに戻す',
    'options.resetConfirm': '設定をデフォルトに戻しますか？\n未保存の変更は上書きされます。',
    'options.yamlLabel': '設定（YAML）',
    'options.basicSettings': '基本設定',
    'options.applyMode': '適用モード',
    'options.applyMode.always': 'always apply',
    'options.applyMode.newTabs': 'only new tab',
    'options.applyMode.manual': 'none',
    'options.fallbackGroup': 'フォールバックグループ',
    'options.fallbackHelp': 'ルールに一致しないタブを移動する先です。無効時はフォールバックを適用しません。',
    'options.fallbackDisabled': '無効',
    'options.fallbackPlaceholder': 'Fallback GroupName',
    'options.rules': 'ルール一覧',
    'options.groupPolicies': 'グループポリシー',
    'options.addGroupPolicy': 'ポリシー追加',
    'options.emptyGroupPolicies': 'グループポリシーは未設定です。',
    'options.groupPolicy.group': 'グループ名',
    'options.groupPolicy.groupPlaceholder': 'Example',
    'options.groupPolicy.color': 'カラー',
    'options.groupPolicy.ttlMinutes': 'TTL(分)',
    'options.groupPolicy.maxTabs': '最大タブ数',
    'options.groupPolicy.lru': 'LRU',
    'options.groupPolicy.remove': 'ポリシー削除',
    'options.addRule': 'ルール追加',
    'options.emptyRules': 'ルールがまだありません。「＋ ルール追加」から始めましょう。',
    'options.sort': '並び替え',
    'options.table.group': 'グループ',
    'options.table.matchMode': 'マッチ方式',
    'options.table.pattern': 'パターン',
    'options.table.color': 'カラー',
    'options.table.actions': '操作',
    'options.table.groupFallback': 'Group {index}',
    'options.table.patternPrefix': 'Pattern',
    'options.table.empty': '(empty)',
    'options.drawer.add': 'ルール追加',
    'options.drawer.edit': 'ルール編集',
    'options.drawer.group': 'グループ名',
    'options.drawer.groupHelp': 'regexモードでは `$1` / `$<name>` でキャプチャ参照できます。',
    'options.drawer.matchMode': 'マッチ方式',
    'options.drawer.matchModeHelp': '`regex` または `wildcard (glob)` を選択します。',
    'options.drawer.pattern': 'パターン',
    'options.drawer.patternHelp': 'regex か wildcard (glob) の書式でマッチ対象を指定します。',
    'options.drawer.color': 'カラー',
    'options.drawer.colorHelp': 'Chrome/Edgeのタブグループで選択可能な色を指定します。',
    'options.drawer.deleteRule': 'ルールを削除',
    'options.drawer.close': '閉じる',
    'options.validation.groupRequired': 'グループ名は必須です',
    'options.validation.patternRequired': 'パターンは必須です',
    'options.validation.regexInvalid': '正規表現が不正です: {message}',
    'options.toast.saved': '設定を保存しました',
    'options.toast.resetLoaded': 'デフォルト設定を読み込みました（保存で反映されます）',
    'options.matchMode.regex': 'regex',
    'options.matchMode.glob': 'wildcard (glob)',
    'options.color.none': 'none'
  },
  en: {
    'common.source': 'Source',
    'common.ui': 'UI',
    'common.save': 'Save',
    'common.close': 'Close',
    'common.validate': 'Validate',
    'common.none': 'none',
    'language.label': 'Language',
    'language.ja': 'Japanese',
    'language.en': 'English',
    'popup.title': 'Grooper — Rule-based tab grouping',
    'popup.runNow': 'Run now',
    'popup.openSettings': 'Open settings',
    'popup.running': 'Running...',
    'popup.done': 'Done',
    'popup.error': 'Error: {message}',
    'popup.failed': 'Failed: {errors}',
    'popup.unknownError': 'unknown error',
    'options.title': 'Settings',
    'options.themeToggle': 'Toggle theme',
    'options.saveHintDirty': 'Unsaved changes (settings are not applied until you save)',
    'options.saveHintClean': 'Saved',
    'options.reset': 'Reset to defaults',
    'options.resetConfirm': 'Reset configuration to defaults?\nYour unsaved changes will be overwritten.',
    'options.yamlLabel': 'Configuration (YAML)',
    'options.basicSettings': 'Basic settings',
    'options.applyMode': 'Apply mode',
    'options.applyMode.always': 'always apply',
    'options.applyMode.newTabs': 'only new tab',
    'options.applyMode.manual': 'none',
    'options.fallbackGroup': 'Fallback group',
    'options.fallbackHelp': 'Destination for tabs that do not match any rule. Disabled means no fallback.',
    'options.fallbackDisabled': 'Disabled',
    'options.fallbackPlaceholder': 'Fallback GroupName',
    'options.rules': 'Rules',
    'options.groupPolicies': 'Group policies',
    'options.addGroupPolicy': 'Add policy',
    'options.emptyGroupPolicies': 'No group policies yet.',
    'options.groupPolicy.group': 'Group',
    'options.groupPolicy.groupPlaceholder': 'Example',
    'options.groupPolicy.color': 'Color',
    'options.groupPolicy.ttlMinutes': 'TTL (min)',
    'options.groupPolicy.maxTabs': 'Max tabs',
    'options.groupPolicy.lru': 'LRU',
    'options.groupPolicy.remove': 'Remove policy',
    'options.addRule': 'Add rule',
    'options.emptyRules': 'No rules yet. Click "+ Add rule" to get started.',
    'options.sort': 'Reorder',
    'options.table.group': 'Group',
    'options.table.matchMode': 'Match mode',
    'options.table.pattern': 'Pattern',
    'options.table.color': 'Color',
    'options.table.actions': 'Actions',
    'options.table.groupFallback': 'Group {index}',
    'options.table.patternPrefix': 'Pattern',
    'options.table.empty': '(empty)',
    'options.drawer.add': 'Add rule',
    'options.drawer.edit': 'Edit rule',
    'options.drawer.group': 'Group name',
    'options.drawer.groupHelp': 'In regex mode, you can reference captures via `$1` / `$<name>`.',
    'options.drawer.matchMode': 'Match mode',
    'options.drawer.matchModeHelp': 'Select `regex` or `wildcard (glob)`.',
    'options.drawer.pattern': 'Pattern',
    'options.drawer.patternHelp': 'Use regex or wildcard (glob) format.',
    'options.drawer.color': 'Color',
    'options.drawer.colorHelp': 'Choose one of the available Chrome/Edge tab-group colors.',
    'options.drawer.deleteRule': 'Delete rule',
    'options.drawer.close': 'Close',
    'options.validation.groupRequired': 'Group name is required',
    'options.validation.patternRequired': 'Pattern is required',
    'options.validation.regexInvalid': 'Invalid regex: {message}',
    'options.toast.saved': 'Settings saved',
    'options.toast.resetLoaded': 'Default configuration loaded (click Save to apply)',
    'options.matchMode.regex': 'regex',
    'options.matchMode.glob': 'wildcard (glob)',
    'options.color.none': 'none'
  }
};

export function normalizeLocale(input: unknown): Locale {
  if (input === 'ja' || input === 'en') return input;
  return DEFAULT_LOCALE;
}

function resolveFromLanguageTag(lang: string | undefined): Locale {
  if (!lang) return DEFAULT_LOCALE;
  return lang.toLowerCase().startsWith('ja') ? 'ja' : 'en';
}

export function detectBrowserLocale(): Locale {
  const chromeLocale =
    typeof chrome !== 'undefined' &&
      chrome.i18n &&
      typeof chrome.i18n.getUILanguage === 'function'
      ? chrome.i18n.getUILanguage()
      : undefined;
  if (chromeLocale) return resolveFromLanguageTag(chromeLocale);
  const navLocale = typeof navigator !== 'undefined' ? navigator.language : undefined;
  return resolveFromLanguageTag(navLocale);
}

export async function loadLocale(): Promise<Locale> {
  const result = await chrome.storage.local.get(LANGUAGE_KEY);
  const stored = result[LANGUAGE_KEY];
  if (stored === 'ja' || stored === 'en') return stored;
  return detectBrowserLocale();
}

export async function saveLocale(locale: Locale): Promise<void> {
  await chrome.storage.local.set({ [LANGUAGE_KEY]: locale });
}

export function t(locale: Locale, key: string, params?: Record<string, string | number>): string {
  const message = MESSAGES[locale][key] ?? MESSAGES[DEFAULT_LOCALE][key] ?? key;
  if (!params) return message;
  return message.replace(/\{(\w+)\}/g, (_, token: string) => String(params[token] ?? ''));
}
