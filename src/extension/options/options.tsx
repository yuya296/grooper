import '../chrome-polyfill.js';
import React, { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Select from '@radix-ui/react-select';
import * as Tabs from '@radix-ui/react-tabs';
import * as Toast from '@radix-ui/react-toast';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { yaml } from '@codemirror/lang-yaml';
import { parseConfigYaml } from '../../core/config.js';
import { validateRulePattern } from '../../core/rule-template.js';
import { TAB_GROUP_COLORS } from '../../core/tab-group-colors.js';
import type { GroupingStrategy, MatchMode } from '../../core/types.js';
import { buildYamlFromUi, parseYamlForUi, type GroupForm, type RuleForm, type UiState } from './uiState.js';
import { LANGUAGE_KEY, loadLocale, saveLocale, t, type Locale } from '../i18n.js';
import { DEFAULT_CONFIG_YAML } from '../storage.js';
import {
  DEFAULT_THEME_MODE,
  THEME_MODE_KEY,
  applyTheme,
  loadThemeMode,
  type ThemeMode
} from '../theme.js';

const NONE_COLOR = '__none__';

function findColorHex(color?: string) {
  if (!color) return undefined;
  return TAB_GROUP_COLORS.find((entry) => entry.value === color)?.hex;
}

function ColorSelect({
  locale,
  value,
  onChange
}: {
  locale: Locale;
  value?: string;
  onChange: (next: string | undefined) => void;
}) {
  return (
    <Select.Root
      value={value ?? NONE_COLOR}
      onValueChange={(next) => onChange(next === NONE_COLOR ? undefined : next)}
    >
      <Select.Trigger className="select-trigger" aria-label="Color">
        <span className="inline">
          <span className="color-dot" style={{ backgroundColor: findColorHex(value) ?? '#cbd5e1' }} />
          <Select.Value placeholder={t(locale, 'options.color.none')} />
        </span>
        <Select.Icon className="select-icon">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport className="select-viewport">
            <Select.Item className="select-item" value={NONE_COLOR}>
              <Select.ItemText>{t(locale, 'options.color.none')}</Select.ItemText>
            </Select.Item>
            {TAB_GROUP_COLORS.map((color) => (
              <Select.Item key={color.value} className="select-item" value={color.value}>
                <span className="inline">
                  <span className="color-dot" style={{ backgroundColor: color.hex }} />
                  <Select.ItemText>{color.label}</Select.ItemText>
                </span>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function AppModeSelect({
  locale,
  value,
  onChange
}: {
  locale: Locale;
  value: UiState['applyMode'];
  onChange: (next: UiState['applyMode']) => void;
}) {
  const modeLabels: Record<UiState['applyMode'], string> = {
    always: t(locale, 'options.applyMode.always'),
    newTabs: t(locale, 'options.applyMode.newTabs'),
    manual: t(locale, 'options.applyMode.manual')
  };
  return (
    <Select.Root value={value} onValueChange={(next) => onChange(next as UiState['applyMode'])}>
      <Select.Trigger className="select-trigger" aria-label="applyMode">
        <Select.Value>{modeLabels[value]}</Select.Value>
        <Select.Icon className="select-icon">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport className="select-viewport">
            {(['manual', 'newTabs', 'always'] as const).map((mode) => (
              <Select.Item key={mode} className="select-item" value={mode}>
                <Select.ItemText>{modeLabels[mode]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function GroupingStrategySelect({
  locale,
  value,
  onChange
}: {
  locale: Locale;
  value: GroupingStrategy;
  onChange: (next: GroupingStrategy) => void;
}) {
  const labels: Record<GroupingStrategy, string> = {
    inheritFirst: t(locale, 'options.groupingStrategy.inheritFirst'),
    ruleFirst: t(locale, 'options.groupingStrategy.ruleFirst'),
    ruleOnly: t(locale, 'options.groupingStrategy.ruleOnly')
  };
  return (
    <Select.Root value={value} onValueChange={(next) => onChange(next as GroupingStrategy)}>
      <Select.Trigger className="select-trigger" aria-label="groupingStrategy">
        <Select.Value>{labels[value]}</Select.Value>
        <Select.Icon className="select-icon">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport className="select-viewport">
            {(['inheritFirst', 'ruleFirst', 'ruleOnly'] as const).map((strategy) => (
              <Select.Item key={strategy} className="select-item" value={strategy}>
                <Select.ItemText>{labels[strategy]}</Select.ItemText>
              </Select.Item>
            ))}
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function MatchModeSelect({
  locale,
  value,
  onChange
}: {
  locale: Locale;
  value: MatchMode;
  onChange: (next: MatchMode) => void;
}) {
  const modeLabels: Record<MatchMode, string> = {
    regex: t(locale, 'options.matchMode.regex'),
    glob: t(locale, 'options.matchMode.glob')
  };
  return (
    <Select.Root value={value} onValueChange={(next) => onChange(next as MatchMode)}>
      <Select.Trigger className="select-trigger" aria-label="matchMode">
        <Select.Value>{modeLabels[value]}</Select.Value>
        <Select.Icon className="select-icon">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport className="select-viewport">
            <Select.Item className="select-item" value="glob">
              <Select.ItemText>{modeLabels.glob}</Select.ItemText>
            </Select.Item>
            <Select.Item className="select-item" value="regex">
              <Select.ItemText>{modeLabels.regex}</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function LanguageSelect({
  locale,
  onChange
}: {
  locale: Locale;
  onChange: (next: Locale) => void;
}) {
  return (
    <Select.Root value={locale} onValueChange={(next) => onChange(next as Locale)}>
      <Select.Trigger className="select-trigger language-trigger" aria-label={t(locale, 'language.label')}>
        <Select.Value>
          {locale === 'ja' ? t(locale, 'language.ja') : t(locale, 'language.en')}
        </Select.Value>
        <Select.Icon className="select-icon">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport className="select-viewport">
            <Select.Item className="select-item" value="ja">
              <Select.ItemText>{t(locale, 'language.ja')}</Select.ItemText>
            </Select.Item>
            <Select.Item className="select-item" value="en">
              <Select.ItemText>{t(locale, 'language.en')}</Select.ItemText>
            </Select.Item>
          </Select.Viewport>
        </Select.Content>
      </Select.Portal>
    </Select.Root>
  );
}

function parsePositiveIntInput(value: string): number | undefined {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number.parseInt(trimmed, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return undefined;
  return parsed;
}

function SourceEditor({
  value,
  onChange
}: {
  value: string;
  onChange: (next: string) => void;
}) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const viewRef = useRef<EditorView | null>(null);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  useEffect(() => {
    if (!hostRef.current) return;
    const state = EditorState.create({
      doc: value,
      extensions: [
        basicSetup,
        yaml(),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            onChangeRef.current(update.state.doc.toString());
          }
        })
      ]
    });
    const view = new EditorView({ state, parent: hostRef.current });
    viewRef.current = view;
    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, []);

  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;
    const current = view.state.doc.toString();
    if (current === value) return;
    view.dispatch({
      changes: { from: 0, to: view.state.doc.length, insert: value }
    });
  }, [value]);

  return <div className="cm-host" ref={hostRef} />;
}

function App() {
  const [activeTab, setActiveTab] = useState<'source' | 'ui'>('ui');
  const [yamlText, setYamlText] = useState('');
  const [savedYamlText, setSavedYamlText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [uiState, setUiState] = useState<UiState>({
    applyMode: 'manual',
    groupingStrategy: 'inheritFirst',
    groups: []
  });
  const [rawConfig, setRawConfig] = useState<Record<string, unknown> | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [themeMode, setThemeMode] = useState<ThemeMode>(DEFAULT_THEME_MODE);
  const [locale, setLocale] = useState<Locale>('ja');

  useEffect(() => {
    void (async () => {
      const configResult = await chrome.storage.local.get('configYaml');
      const loadedYaml = (configResult.configYaml as string) ?? '';
      setYamlText(loadedYaml);
      setSavedYamlText(loadedYaml);
      const parsed = parseYamlForUi(loadedYaml);
      if (parsed.ok) {
        setRawConfig(parsed.rawConfig);
        setUiState(parsed.uiState);
        setErrors([]);
      } else {
        setErrors(parsed.errors);
      }
      const loadedTheme = await loadThemeMode();
      setThemeMode(loadedTheme);
      applyTheme(loadedTheme, document, window.matchMedia('(prefers-color-scheme: dark)').matches);
      const loadedLocale = await loadLocale();
      setLocale(loadedLocale);
      document.documentElement.lang = loadedLocale;
    })();
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = () => applyTheme(themeMode, document, media.matches);
    apply();
    media.addEventListener('change', apply);
    return () => media.removeEventListener('change', apply);
  }, [themeMode]);

  useEffect(() => {
    document.documentElement.lang = locale;
    document.title = t(locale, 'options.title');
  }, [locale]);

  useEffect(() => {
    const onStorageChanged = (changes: Record<string, chrome.storage.StorageChange>, areaName: string) => {
      if (areaName !== 'local' || !changes[LANGUAGE_KEY]) return;
      const next = changes[LANGUAGE_KEY].newValue;
      if (next === 'ja' || next === 'en') {
        setLocale(next);
      }
    };
    chrome.storage.onChanged.addListener(onStorageChanged);
    return () => chrome.storage.onChanged.removeListener(onStorageChanged);
  }, []);

  async function updateThemeMode(next: ThemeMode) {
    setThemeMode(next);
    await chrome.storage.local.set({ [THEME_MODE_KEY]: next });
  }

  async function updateLocale(next: Locale) {
    setLocale(next);
    document.documentElement.lang = next;
    await saveLocale(next);
  }

  const isDarkResolved =
    themeMode === 'dark' ||
    (themeMode === 'system' &&
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  async function toggleThemeMode() {
    await updateThemeMode(isDarkResolved ? 'light' : 'dark');
  }

  const hasUnsavedChanges = yamlText !== savedYamlText;

  useEffect(() => {
    if (!hasUnsavedChanges) return;
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges]);

  function syncFromUi(nextUiState: UiState, baseRawConfig = rawConfig) {
    const nextResult = buildYamlFromUi(baseRawConfig, nextUiState);
    setUiState(nextUiState);
    setRawConfig(nextResult.rawConfig);
    setYamlText(nextResult.yaml);
  }

  function switchTab(nextTab: 'source' | 'ui') {
    if (nextTab === 'ui') {
      const result = parseYamlForUi(yamlText);
      if (!result.ok) {
        setErrors(result.errors);
        return;
      }
      setRawConfig(result.rawConfig);
      setUiState(result.uiState);
      setErrors([]);
    }
    setActiveTab(nextTab);
  }

  function updateGroup(index: number, nextGroup: GroupForm) {
    const nextGroups = uiState.groups.map((group, i) => (i === index ? nextGroup : group));
    syncFromUi({ ...uiState, groups: nextGroups });
  }

  function removeGroup(index: number) {
    const nextGroups = uiState.groups.filter((_, i) => i !== index);
    syncFromUi({ ...uiState, groups: nextGroups });
  }

  function addGroup() {
    syncFromUi({
      ...uiState,
      groups: [...uiState.groups, { name: '', color: undefined, ttlMinutes: undefined, maxTabs: undefined, lru: undefined, rules: [] }]
    });
  }

  function addRule(groupIndex: number) {
    const nextGroups = uiState.groups.map((group, i) =>
      i === groupIndex ? { ...group, rules: [...group.rules, { pattern: '', matchMode: 'glob' }] } : group
    );
    syncFromUi({ ...uiState, groups: nextGroups });
  }

  function updateRule(groupIndex: number, ruleIndex: number, nextRule: RuleForm) {
    const nextGroups = uiState.groups.map((group, i) => {
      if (i !== groupIndex) return group;
      const nextRules = group.rules.map((rule, j) => (j === ruleIndex ? nextRule : rule));
      return { ...group, rules: nextRules };
    });
    syncFromUi({ ...uiState, groups: nextGroups });
  }

  function removeRule(groupIndex: number, ruleIndex: number) {
    const nextGroups = uiState.groups.map((group, i) => {
      if (i !== groupIndex) return group;
      return { ...group, rules: group.rules.filter((_, j) => j !== ruleIndex) };
    });
    syncFromUi({ ...uiState, groups: nextGroups });
  }

  function getPatternRegexError(pattern: string, matchMode: MatchMode) {
    if (matchMode !== 'regex') return null;
    const trimmed = pattern.trim();
    if (!trimmed) return null;
    const error = validateRulePattern(trimmed, matchMode);
    if (!error) return null;
    return t(locale, 'options.validation.regexInvalid', { message: error });
  }

  function validateYaml() {
    const result = parseConfigYaml(yamlText);
    if (result.errors.length > 0) {
      setErrors(result.errors.map((e) => `${e.path}: ${e.message}`));
      return { ok: false, errors: result.errors } as const;
    }
    setErrors([]);
    return { ok: true, config: result.config! } as const;
  }

  async function saveYaml() {
    const result = validateYaml();
    if (!result.ok) return;
    await chrome.storage.local.set({ configYaml: yamlText });
    setSavedYamlText(yamlText);
    setErrors([]);
    setToastMessage(t(locale, 'options.toast.saved'));
    setToastOpen(true);
  }

  function resetToDefaultWithConfirm() {
    const confirmed = window.confirm(t(locale, 'options.resetConfirm'));
    if (!confirmed) return;
    setYamlText(DEFAULT_CONFIG_YAML);
    setErrors([]);
    const parsed = parseYamlForUi(DEFAULT_CONFIG_YAML);
    if (parsed.ok) {
      setRawConfig(parsed.rawConfig);
      setUiState(parsed.uiState);
    }
    setToastMessage(t(locale, 'options.toast.resetLoaded'));
    setToastOpen(true);
  }

  return (
    <Toast.Provider swipeDirection="right">
      <div className="card">
        <div className="header">
          <div className="title-wrap">
            <img className="title-logo" src="icons/icon-32.png" alt="" />
            <div>
              <h1 className="title">{t(locale, 'options.title')}</h1>
            </div>
          </div>
          <div className="actions">
            <LanguageSelect locale={locale} onChange={(next) => void updateLocale(next)} />
            <button
              className="btn btn-ghost theme-toggle"
              type="button"
              onClick={() => void toggleThemeMode()}
              aria-label={t(locale, 'options.themeToggle')}
              title={isDarkResolved ? 'dark' : 'light'}
            >
              <span className={`theme-icon ${!isDarkResolved ? 'active' : ''}`} aria-hidden>
                ☀
              </span>
              <span className={`theme-icon ${isDarkResolved ? 'active' : ''}`} aria-hidden>
                ☾
              </span>
            </button>
            <span className={`save-hint ${hasUnsavedChanges ? 'dirty' : 'clean'}`}>
              {hasUnsavedChanges ? t(locale, 'options.saveHintDirty') : t(locale, 'options.saveHintClean')}
            </span>
            <button className="btn" type="button" onClick={resetToDefaultWithConfirm}>
              {t(locale, 'options.reset')}
            </button>
            <button className="btn" type="button" onClick={() => validateYaml()}>
              {t(locale, 'common.validate')}
            </button>
            <button
              className="btn btn-primary"
              type="button"
              onClick={() => void saveYaml()}
              disabled={!hasUnsavedChanges}
            >
              {t(locale, 'common.save')}
            </button>
          </div>
        </div>

        <Tabs.Root value={activeTab} onValueChange={(next) => switchTab(next as 'source' | 'ui')}>
          <Tabs.List className="tabs">
            <Tabs.Trigger className="tab-trigger" value="ui">
              {t(locale, 'common.ui')}
            </Tabs.Trigger>
            <Tabs.Trigger className="tab-trigger" value="source">
              {t(locale, 'common.source')}
            </Tabs.Trigger>
          </Tabs.List>

          {errors.length > 0 && <div className="error">{errors.join('\n')}</div>}

          <Tabs.Content value="source">
            <div className="panel">
              <label className="label" htmlFor="yaml">
                {t(locale, 'options.yamlLabel')}
              </label>
              <SourceEditor value={yamlText} onChange={setYamlText} />
            </div>
          </Tabs.Content>

          <Tabs.Content value="ui">
            <div className="panel stack">
              <h3 className="section-title">{t(locale, 'options.basicSettings')}</h3>
              <div className="settings-row">
                <div className="field-block">
                  <label className="label" htmlFor="applyMode">
                    {t(locale, 'options.applyMode')}
                  </label>
                  <AppModeSelect
                    locale={locale}
                    value={uiState.applyMode}
                    onChange={(next) => syncFromUi({ ...uiState, applyMode: next })}
                  />
                </div>
                <div className="field-block">
                  <label className="label" htmlFor="groupingStrategy">
                    {t(locale, 'options.groupingStrategy')}
                  </label>
                  <GroupingStrategySelect
                    locale={locale}
                    value={uiState.groupingStrategy}
                    onChange={(next) => syncFromUi({ ...uiState, groupingStrategy: next })}
                  />
                </div>
              </div>

              <div className="rules-head">
                <h3 className="section-title">{t(locale, 'options.groups')}</h3>
                <div className="add-rule-wrap">
                  <button type="button" className="btn btn-primary" onClick={addGroup}>
                    ＋ {t(locale, 'options.addGroup')}
                  </button>
                </div>
              </div>

              {uiState.groups.length === 0 ? (
                <div className="table-wrap">
                  <div className="empty-state">
                    <div className="empty-state-icon">🧩</div>
                    <div className="empty-state-text">{t(locale, 'options.emptyGroups')}</div>
                  </div>
                </div>
              ) : (
                uiState.groups.map((group, groupIndex) => (
                  <div className="table-wrap" key={`group-${groupIndex}`}>
                    <div className="rules-head" style={{ padding: '12px 14px' }}>
                      <h4 className="section-title">{t(locale, 'options.groupTitle', { index: groupIndex + 1 })}</h4>
                      <button type="button" className="btn btn-danger" onClick={() => removeGroup(groupIndex)}>
                        {t(locale, 'options.group.remove')}
                      </button>
                    </div>

                    <div style={{ padding: '0 14px 14px' }} className="stack">
                      <div className="settings-row">
                        <div className="field-block">
                          <label className="label">{t(locale, 'options.group.name')}</label>
                          <input
                            className="input"
                            value={group.name}
                            placeholder={t(locale, 'options.group.namePlaceholder')}
                            onChange={(e) => updateGroup(groupIndex, { ...group, name: e.currentTarget.value })}
                          />
                        </div>
                        <div className="field-block">
                          <label className="label">{t(locale, 'options.group.color')}</label>
                          <ColorSelect
                            locale={locale}
                            value={group.color}
                            onChange={(next) => updateGroup(groupIndex, { ...group, color: next })}
                          />
                        </div>
                      </div>

                      <div className="settings-row">
                        <div className="field-block">
                          <label className="label">{t(locale, 'options.group.ttlMinutes')}</label>
                          <input
                            className="input"
                            inputMode="numeric"
                            placeholder="30"
                            value={group.ttlMinutes != null ? String(group.ttlMinutes) : ''}
                            onChange={(e) =>
                              updateGroup(groupIndex, {
                                ...group,
                                ttlMinutes: parsePositiveIntInput(e.currentTarget.value)
                              })
                            }
                          />
                        </div>
                        <div className="field-block">
                          <label className="label">{t(locale, 'options.group.maxTabs')}</label>
                          <input
                            className="input"
                            inputMode="numeric"
                            placeholder="10"
                            value={group.maxTabs != null ? String(group.maxTabs) : ''}
                            onChange={(e) =>
                              updateGroup(groupIndex, {
                                ...group,
                                maxTabs: parsePositiveIntInput(e.currentTarget.value)
                              })
                            }
                          />
                        </div>
                      </div>

                      <div className="inline">
                        <label className="label" style={{ marginBottom: 0 }}>
                          {t(locale, 'options.group.lru')}
                        </label>
                        <input
                          type="checkbox"
                          checked={group.lru === true}
                          onChange={(e) => updateGroup(groupIndex, { ...group, lru: e.currentTarget.checked ? true : undefined })}
                        />
                      </div>

                      <div className="rules-head">
                        <h4 className="section-title">{t(locale, 'options.group.rules')}</h4>
                        <button type="button" className="btn" onClick={() => addRule(groupIndex)}>
                          ＋ {t(locale, 'options.group.addRule')}
                        </button>
                      </div>

                      {group.rules.length === 0 ? (
                        <div className="empty-state">
                          <div className="empty-state-text">{t(locale, 'options.emptyRules')}</div>
                        </div>
                      ) : (
                        <table>
                          <thead>
                            <tr>
                              <th>{t(locale, 'options.rule.pattern')}</th>
                              <th>{t(locale, 'options.rule.matchMode')}</th>
                              <th>{t(locale, 'options.rule.actions')}</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.rules.map((rule, ruleIndex) => {
                              const patternError = getPatternRegexError(rule.pattern, rule.matchMode);
                              return (
                                <tr key={`group-${groupIndex}-rule-${ruleIndex}`}>
                                  <td>
                                    <input
                                      className="input"
                                      value={rule.pattern}
                                      onChange={(e) =>
                                        updateRule(groupIndex, ruleIndex, { ...rule, pattern: e.currentTarget.value })
                                      }
                                    />
                                    {patternError && <div className="field-error">{patternError}</div>}
                                  </td>
                                  <td style={{ minWidth: 190 }}>
                                    <MatchModeSelect
                                      locale={locale}
                                      value={rule.matchMode}
                                      onChange={(next) => updateRule(groupIndex, ruleIndex, { ...rule, matchMode: next })}
                                    />
                                  </td>
                                  <td style={{ width: 96 }}>
                                    <button
                                      type="button"
                                      className="row-action-btn"
                                      aria-label={t(locale, 'options.rule.remove')}
                                      onClick={() => removeRule(groupIndex, ruleIndex)}
                                      style={{ opacity: 1, pointerEvents: 'auto' }}
                                    >
                                      🗑
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs.Content>
        </Tabs.Root>

        <Toast.Root className="toast-root" open={toastOpen} onOpenChange={setToastOpen} duration={2200}>
          <Toast.Title className="toast-title">{toastMessage}</Toast.Title>
        </Toast.Root>
        <Toast.Viewport className="toast-viewport" />
      </div>
    </Toast.Provider>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('root element not found');
createRoot(root).render(<App />);
