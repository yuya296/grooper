import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Select from '@radix-ui/react-select';
import * as Switch from '@radix-ui/react-switch';
import * as Tabs from '@radix-ui/react-tabs';
import * as Toast from '@radix-ui/react-toast';
import { basicSetup } from 'codemirror';
import { EditorState } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { yaml } from '@codemirror/lang-yaml';
import {
  DndContext,
  DragOverlay,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors
} from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { parseConfigYaml } from '../../core/config.js';
import { buildYamlFromUi, parseYamlForUi, type RuleForm, type UiState } from './uiState.js';

const NONE_COLOR = '__none__';
const GROUP_COLORS = [
  { value: 'grey', label: 'Grey', hex: '#9ca3af' },
  { value: 'blue', label: 'Blue', hex: '#3b82f6' },
  { value: 'red', label: 'Red', hex: '#ef4444' },
  { value: 'yellow', label: 'Yellow', hex: '#eab308' },
  { value: 'green', label: 'Green', hex: '#22c55e' },
  { value: 'pink', label: 'Pink', hex: '#ec4899' },
  { value: 'purple', label: 'Purple', hex: '#a855f7' },
  { value: 'cyan', label: 'Cyan', hex: '#06b6d4' },
  { value: 'orange', label: 'Orange', hex: '#f97316' }
] as const;

function findColorHex(color?: string) {
  if (!color) return undefined;
  return GROUP_COLORS.find((entry) => entry.value === color)?.hex;
}

function ColorSelect({
  value,
  onChange
}: {
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
          <Select.Value placeholder="none" />
        </span>
        <Select.Icon className="select-icon">▾</Select.Icon>
      </Select.Trigger>
      <Select.Portal>
        <Select.Content className="select-content" position="popper" sideOffset={6}>
          <Select.Viewport className="select-viewport">
            <Select.Item className="select-item" value={NONE_COLOR}>
              <Select.ItemText>none</Select.ItemText>
            </Select.Item>
            {GROUP_COLORS.map((color) => (
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
  value,
  onChange
}: {
  value: UiState['applyMode'];
  onChange: (next: UiState['applyMode']) => void;
}) {
  const modeLabels: Record<UiState['applyMode'], string> = {
    always: 'always apply',
    newTabs: 'only new tab',
    manual: 'none'
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

interface RuleRow extends RuleForm {
  rowId: string;
}

function applyPriorityFromOrder(rules: RuleForm[]): RuleForm[] {
  const size = rules.length;
  return rules.map((rule, index) => ({
    ...rule,
    priority: size - index
  }));
}

function SortHandle({ rowId }: { rowId: string }) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: rowId });
  return (
    <button ref={setNodeRef} type="button" className="handle" {...attributes} {...listeners} aria-label="並び替え">
      ⋮⋮
    </button>
  );
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
  const [activeTab, setActiveTab] = useState<'source' | 'ui'>('source');
  const [yamlText, setYamlText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [uiState, setUiState] = useState<UiState>({ applyMode: 'manual', fallbackGroup: undefined, rules: [] });
  const [rawConfig, setRawConfig] = useState<Record<string, unknown> | null>(null);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);
  const [overDragId, setOverDragId] = useState<string | null>(null);
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    void (async () => {
      const configResult = await chrome.storage.local.get('configYaml');
      setYamlText((configResult.configYaml as string) ?? '');
    })();
  }, []);

  const ruleRows = useMemo<RuleRow[]>(
    () =>
      uiState.rules.map((rule, index) => ({
        ...rule,
        rowId: String(index)
      })),
    [uiState.rules]
  );

  function syncFromUi(nextUiState: UiState, baseRawConfig = rawConfig) {
    const normalizedRules = applyPriorityFromOrder(nextUiState.rules);
    const normalizedState: UiState = { ...nextUiState, rules: normalizedRules };
    const normalizedResult = buildYamlFromUi(baseRawConfig, normalizedState);
    setUiState(normalizedState);
    setRawConfig(normalizedResult.rawConfig);
    setYamlText(normalizedResult.yaml);
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

  function updateRule(index: number, patch: Partial<RuleForm>) {
    const nextRules = uiState.rules.map((rule, i) => (i === index ? { ...rule, ...patch } : rule));
    syncFromUi({ ...uiState, rules: nextRules });
  }

  function removeRule(index: number) {
    const nextRules = uiState.rules.filter((_, i) => i !== index);
    syncFromUi({ ...uiState, rules: nextRules });
    if (selectedRuleIndex === index) setSelectedRuleIndex(null);
  }

  function validateYaml() {
    const result = parseConfigYaml(yamlText);
    if (result.errors.length > 0) {
      setErrors(result.errors.map((e) => `${e.path}: ${e.message}`));
      return { ok: false, errors: result.errors } as const;
    }
    setErrors(['OK']);
    return { ok: true, config: result.config! } as const;
  }

  async function saveYaml() {
    const result = validateYaml();
    if (!result.ok) return;
    await chrome.storage.local.set({ configYaml: yamlText });
    setErrors(['保存しました']);
    setToastMessage('設定を保存しました');
    setToastOpen(true);
  }

  async function exportYaml() {
    try {
      await navigator.clipboard.writeText(yamlText);
      setErrors(['クリップボードにコピーしました']);
    } catch {
      const exported = prompt('YAMLをコピーしてください', yamlText);
      if (exported != null) setErrors(['エクスポートしました']);
    }
  }

  function importYaml() {
    const imported = prompt('YAMLを貼り付けてください');
    if (imported == null) return;
    setYamlText(imported);
    const result = parseConfigYaml(imported);
    if (result.errors.length > 0) {
      setErrors(result.errors.map((e) => `${e.path}: ${e.message}`));
      return;
    }
    setErrors(['OK']);
    if (activeTab === 'ui') {
      const uiParse = parseYamlForUi(imported);
      if (uiParse.ok) {
        setUiState(uiParse.uiState);
        setRawConfig(uiParse.rawConfig);
      }
    }
  }

  function onDragStart(event: DragStartEvent) {
    setActiveDragId(String(event.active.id));
    setOverDragId(String(event.active.id));
  }

  function onDragOver(event: DragOverEvent) {
    setOverDragId(event.over ? String(event.over.id) : null);
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDragId(null);
    setOverDragId(null);
    if (!over || active.id === over.id) return;
    const fromIndex = Number(active.id);
    const toIndex = Number(over.id);
    if (!Number.isFinite(fromIndex) || !Number.isFinite(toIndex)) return;
    const nextRules = arrayMove(uiState.rules, fromIndex, toIndex);
    syncFromUi({ ...uiState, rules: nextRules });
    if (selectedRuleIndex != null) {
      if (selectedRuleIndex === fromIndex) setSelectedRuleIndex(toIndex);
    }
  }

  function onDragCancel() {
    setActiveDragId(null);
    setOverDragId(null);
  }

  const columnHelper = createColumnHelper<RuleRow>();
  const columns = useMemo(
    () => [
      columnHelper.display({
        id: 'drag',
        header: '',
        size: 50,
        cell: ({ row }) => <SortHandle rowId={row.original.rowId} />
      }),
      columnHelper.accessor('group', {
        header: 'グループ',
        cell: ({ row }) => (
          <button type="button" className="row-title" onClick={() => setSelectedRuleIndex(row.index)}>
            {row.original.group || `Group ${row.index + 1}`}
          </button>
        )
      }),
      columnHelper.accessor('pattern', {
        header: 'パターン',
        cell: (ctx) => <span className="badge">{ctx.getValue() || 'Unset'}</span>
      }),
      columnHelper.accessor('color', {
        header: 'ステータス',
        cell: (ctx) => {
          const color = ctx.getValue();
          const hex = findColorHex(color);
          return (
            <span className="badge">
              <span className="color-dot" style={{ backgroundColor: hex ?? '#cbd5e1' }} />
              {color || 'none'}
            </span>
          );
        }
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button
            type="button"
            className="row-action-btn"
            aria-label="ルールを削除"
            onClick={() => removeRule(row.index)}
          >
            🗑
          </button>
        )
      })
    ],
    [columnHelper]
  );

  const table = useReactTable({
    data: ruleRows,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  const selectedRule = selectedRuleIndex != null ? uiState.rules[selectedRuleIndex] : undefined;
  const isDrawerOpen = selectedRuleIndex != null;
  const activeDragRow = activeDragId != null ? ruleRows.find((row) => row.rowId === activeDragId) : undefined;

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedRuleIndex(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen]);

  return (
    <Toast.Provider swipeDirection="right">
      <div className="card">
      <div className="header">
        <div className="title-wrap">
          <h1 className="title">設定</h1>
        </div>
        <div className="actions">
          <button className="btn" type="button" onClick={() => validateYaml()}>
            検証
          </button>
          <button className="btn btn-primary" type="button" onClick={() => void saveYaml()}>
            保存
          </button>
          <button className="btn" type="button" onClick={() => void exportYaml()}>
            エクスポート
          </button>
          <button className="btn" type="button" onClick={() => importYaml()}>
            インポート
          </button>
        </div>
      </div>

      <Tabs.Root value={activeTab} onValueChange={(next) => switchTab(next as 'source' | 'ui')}>
        <Tabs.List className="tabs">
          <Tabs.Trigger className="tab-trigger" value="source">
            Source
          </Tabs.Trigger>
          <Tabs.Trigger className="tab-trigger" value="ui">
            UI
          </Tabs.Trigger>
        </Tabs.List>

        {errors.length > 0 && <div className="error">{errors.join('\n')}</div>}

        <Tabs.Content value="source">
          <div className="panel">
            <label className="label" htmlFor="yaml">
              設定（YAML）
            </label>
            <SourceEditor value={yamlText} onChange={setYamlText} />
          </div>
        </Tabs.Content>

        <Tabs.Content value="ui">
          <div className="panel stack">
            <h3 className="section-title">基本設定</h3>
            <div className="settings-row">
              <div className="field-block">
                <label className="label" htmlFor="applyMode">
                  適用モード
                </label>
                <AppModeSelect
                  value={uiState.applyMode}
                  onChange={(next) => syncFromUi({ ...uiState, applyMode: next })}
                />
              </div>
              <div className="field-block">
                <label className="label" htmlFor="fallbackEnabled">
                  <span className="label-inline">
                    フォールバックグループ
                    <span className="info-tip" aria-label="フォールバック説明">
                      ⓘ
                      <span className="tooltip">
                        ルールに一致しないタブを移動する先です。無効時はフォールバックを適用しません。
                      </span>
                    </span>
                  </span>
                </label>
                <div className="fallback-controls">
                  <label className="fallback-toggle" htmlFor="fallbackEnabled">
                    <Switch.Root
                      id="fallbackEnabled"
                      className="switch-root"
                      checked={uiState.fallbackGroup !== undefined}
                      onCheckedChange={(checked) =>
                        syncFromUi({
                          ...uiState,
                          fallbackGroup: checked ? uiState.fallbackGroup ?? '' : undefined
                        })
                      }
                    >
                      <Switch.Thumb className="switch-thumb" />
                    </Switch.Root>
                    <span className="muted">無効</span>
                  </label>
                  {uiState.fallbackGroup !== undefined && (
                    <input
                      id="fallbackGroup"
                      className="input fallback-input"
                      placeholder="Fallback GroupName"
                      value={uiState.fallbackGroup}
                      onChange={(e) => syncFromUi({ ...uiState, fallbackGroup: e.currentTarget.value })}
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="rules-head">
              <h3 className="section-title">ルール一覧</h3>
              <div className="add-rule-wrap">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() =>
                    syncFromUi({
                      ...uiState,
                      rules: [...uiState.rules, { pattern: '', group: '', color: undefined, priority: undefined }]
                    })
                  }
                >
                  ＋
                </button>
              </div>
            </div>
            <div className="grid">
              <div className="table-wrap">
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={onDragStart}
                  onDragOver={onDragOver}
                  onDragEnd={onDragEnd}
                  onDragCancel={onDragCancel}
                >
                  <table>
                    <thead>
                      {table.getHeaderGroups().map((headerGroup) => (
                        <tr key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <th key={header.id}>
                              {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                            </th>
                          ))}
                        </tr>
                      ))}
                    </thead>
                    <tbody>
                      <SortableContext items={ruleRows.map((row) => row.rowId)} strategy={verticalListSortingStrategy}>
                        {table.getRowModel().rows.map((row) => (
                          <tr
                            key={row.id}
                            className={[
                              activeDragId === row.original.rowId ? 'drag-source' : '',
                              overDragId === row.original.rowId && activeDragId !== row.original.rowId ? 'drop-target' : ''
                            ]
                              .join(' ')
                              .trim()}
                          >
                            {row.getVisibleCells().map((cell) => (
                              <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                            ))}
                          </tr>
                        ))}
                      </SortableContext>
                    </tbody>
                  </table>
                  <DragOverlay>
                    {activeDragRow ? (
                      <div className="drag-overlay">
                        <div className="drag-overlay-title">{activeDragRow.group || 'Group'}</div>
                        <div className="drag-overlay-sub">Pattern: {activeDragRow.pattern || '(empty)'}</div>
                      </div>
                    ) : null}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
          </div>
        </Tabs.Content>
      </Tabs.Root>

      <div
        className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setSelectedRuleIndex(null)}
        aria-hidden={!isDrawerOpen}
      />
      <aside className={`drawer ${isDrawerOpen ? 'open' : ''}`} aria-hidden={!isDrawerOpen}>
        <div className="drawer-head">
          <h3 className="side-title">ルール編集</h3>
          <button type="button" className="icon-btn" onClick={() => setSelectedRuleIndex(null)} aria-label="閉じる">
            ×
          </button>
        </div>
        <div className="drawer-body">
          {!selectedRule && <div className="muted">グループをクリックして選択してください。</div>}
          {selectedRule && (
            <div className="stack">
              <div>
                <label className="label">グループ名</label>
                <input
                  className="input"
                  value={selectedRule.group}
                  onChange={(e) => updateRule(selectedRuleIndex!, { group: e.currentTarget.value })}
                />
              </div>
              <div>
                <label className="label">パターン</label>
                <input
                  className="input"
                  value={selectedRule.pattern}
                  onChange={(e) => updateRule(selectedRuleIndex!, { pattern: e.currentTarget.value })}
                />
                <div className="muted">正規表現または文字列パターンを入力してください</div>
              </div>
              <div>
                <label className="label">ステータス（色）</label>
                <ColorSelect
                  value={selectedRule.color}
                  onChange={(next) => updateRule(selectedRuleIndex!, { color: next })}
                />
                <div className="muted">Chrome タブグループの色を選択</div>
              </div>
              <div className="drawer-actions">
                <button type="button" className="btn btn-primary" onClick={() => setSelectedRuleIndex(null)}>
                  保存
                </button>
                <button type="button" className="btn" onClick={() => setSelectedRuleIndex(null)}>
                  閉じる
                </button>
              </div>
            </div>
          )}
        </div>
      </aside>
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
