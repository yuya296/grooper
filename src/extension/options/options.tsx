import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import * as Select from '@radix-ui/react-select';
import { DndContext, type DragEndEvent, PointerSensor, closestCenter, useSensor, useSensors } from '@dnd-kit/core';
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { parseConfigYaml } from '../../core/config.js';
import { createPlan } from '../../core/planner.js';
import type { StateSnapshot } from '../../core/types.js';
import { appendHistoryEntry, formatPreviewActions, popLatestHistory, type HistoryEntry } from './advanced.js';
import { buildYamlFromUi, parseYamlForUi, type RuleForm, type UiState } from './uiState.js';

const HISTORY_KEY = 'configHistory';
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

interface RuleRow extends RuleForm {
  rowId: string;
}

function SortHandle({ rowId }: { rowId: string }) {
  const { attributes, listeners, setNodeRef } = useSortable({ id: rowId });
  return (
    <button ref={setNodeRef} type="button" className="handle" {...attributes} {...listeners} aria-label="並び替え">
      ⋮⋮
    </button>
  );
}

function App() {
  const [activeTab, setActiveTab] = useState<'source' | 'ui'>('source');
  const [yamlText, setYamlText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [previewText, setPreviewText] = useState('');
  const [historyEntries, setHistoryEntries] = useState<HistoryEntry[]>([]);
  const [uiState, setUiState] = useState<UiState>({ applyMode: 'manual', fallbackGroup: undefined, rules: [] });
  const [rawConfig, setRawConfig] = useState<Record<string, unknown> | null>(null);
  const [selectedRuleIndex, setSelectedRuleIndex] = useState<number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  useEffect(() => {
    void (async () => {
      const [configResult, historyResult] = await Promise.all([
        chrome.storage.local.get('configYaml'),
        chrome.storage.local.get(HISTORY_KEY)
      ]);
      setYamlText((configResult.configYaml as string) ?? '');
      setHistoryEntries((historyResult[HISTORY_KEY] as HistoryEntry[]) ?? []);
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
    const result = buildYamlFromUi(baseRawConfig, nextUiState);
    setUiState(nextUiState);
    setRawConfig(result.rawConfig);
    setYamlText(result.yaml);
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
    const current = await chrome.storage.local.get('configYaml');
    const existing = (current.configYaml as string) ?? '';
    if (existing && existing !== yamlText) {
      const nextHistory = appendHistoryEntry(historyEntries, existing, new Date().toISOString());
      await chrome.storage.local.set({ [HISTORY_KEY]: nextHistory });
      setHistoryEntries(nextHistory);
    }
    await chrome.storage.local.set({ configYaml: yamlText });
    setErrors(['保存しました']);
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

  async function buildStateSnapshot(): Promise<StateSnapshot> {
    const [tabs, groups, lastActive] = await Promise.all([
      chrome.tabs.query({}),
      chrome.tabGroups.query({}),
      chrome.storage.local.get('lastActiveAt')
    ]);
    const lastActiveMap = (lastActive.lastActiveAt as Record<string, number>) ?? {};
    return {
      tabs: tabs.map((tab) => ({
        id: tab.id!,
        url: tab.url,
        groupId: tab.groupId,
        windowId: tab.windowId,
        openerTabId: tab.openerTabId,
        active: tab.active,
        pinned: tab.pinned,
        index: tab.index,
        lastAccessed: tab.lastAccessed,
        lastActiveAt: lastActiveMap[String(tab.id!)]
      })),
      groups: groups.map((group) => ({
        id: group.id,
        title: group.title ?? '',
        color: group.color,
        windowId: group.windowId
      }))
    };
  }

  async function previewPlan() {
    const result = validateYaml();
    if (!result.ok) return;
    const state = await buildStateSnapshot();
    const plan = createPlan(state, result.config, { includeCleanup: true });
    if (plan.actions.length === 0) {
      setPreviewText('変更はありません。');
      return;
    }
    setPreviewText(formatPreviewActions(plan.actions));
  }

  async function rollback() {
    const result = popLatestHistory(historyEntries);
    if (!result) {
      setErrors(['履歴がありません']);
      return;
    }
    const { latest, remaining } = result;
    await chrome.storage.local.set({ configYaml: latest.yaml, [HISTORY_KEY]: remaining });
    setYamlText(latest.yaml);
    setHistoryEntries(remaining);
    setErrors(['直前の履歴へロールバックしました']);
    if (activeTab === 'ui') {
      const uiParse = parseYamlForUi(latest.yaml);
      if (uiParse.ok) {
        setUiState(uiParse.uiState);
        setRawConfig(uiParse.rawConfig);
      }
    }
  }

  function onDragEnd(event: DragEndEvent) {
    const { active, over } = event;
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
        header: 'Group',
        cell: ({ row }) => (
          <button type="button" className="row-title" onClick={() => setSelectedRuleIndex(row.index)}>
            {row.original.group || `Group ${row.index + 1}`}
          </button>
        )
      }),
      columnHelper.accessor('pattern', {
        header: 'Pattern',
        cell: (ctx) => <span className="badge">{ctx.getValue() || 'Unset'}</span>
      }),
      columnHelper.accessor('color', {
        header: 'Status',
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
      columnHelper.accessor('priority', {
        header: 'Target',
        cell: (ctx) => <span>{ctx.getValue() ?? '-'}</span>
      }),
      columnHelper.display({
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <button type="button" className="btn btn-ghost" onClick={() => removeRule(row.index)}>
            削除
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

  useEffect(() => {
    if (!isDrawerOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedRuleIndex(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isDrawerOpen]);

  return (
    <div className="card">
      <div className="header">
        <div>
          <h1 className="title">Tab Grouper Options</h1>
          <p className="subtitle">Source / UI を切り替えて設定を編集できます。</p>
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
          <button className="btn" type="button" onClick={() => void previewPlan()}>
            プレビュー
          </button>
          <button className="btn" type="button" onClick={() => void rollback()}>
            ロールバック
          </button>
        </div>
      </div>

      <div className="tabs">
        <button type="button" className={`tab ${activeTab === 'source' ? 'active' : ''}`} onClick={() => switchTab('source')}>
          Source
        </button>
        <button type="button" className={`tab ${activeTab === 'ui' ? 'active' : ''}`} onClick={() => switchTab('ui')}>
          UI
        </button>
      </div>

      {errors.length > 0 && <div className="error">{errors.join('\n')}</div>}

      {activeTab === 'source' && (
        <div className="panel">
          <label className="label" htmlFor="yaml">
            設定（YAML）
          </label>
          <textarea id="yaml" className="textarea" value={yamlText} onChange={(e) => setYamlText(e.currentTarget.value)} />
        </div>
      )}

      {activeTab === 'ui' && (
        <div className="panel stack">
          <div className="inline">
            <div>
              <label className="label" htmlFor="applyMode">
                applyMode
              </label>
              <select
                id="applyMode"
                className="select"
                value={uiState.applyMode}
                onChange={(e) => syncFromUi({ ...uiState, applyMode: e.currentTarget.value as UiState['applyMode'] })}
              >
                <option value="manual">manual</option>
                <option value="newTabs">newTabs</option>
                <option value="always">always</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="fallbackEnabled">
                fallbackGroup
              </label>
              <div className="inline">
                <label className="inline" htmlFor="fallbackEnabled">
                  <input
                    id="fallbackEnabled"
                    type="checkbox"
                    checked={uiState.fallbackGroup !== undefined}
                    onChange={(e) =>
                      syncFromUi({
                        ...uiState,
                        fallbackGroup: e.currentTarget.checked ? uiState.fallbackGroup ?? '' : undefined
                      })
                    }
                  />
                  <span className="muted">Fallbackを有効化</span>
                </label>
                <input
                  id="fallbackGroup"
                  className="input"
                  placeholder="Fallback GroupName"
                  value={uiState.fallbackGroup ?? ''}
                  disabled={uiState.fallbackGroup === undefined}
                  onChange={(e) => syncFromUi({ ...uiState, fallbackGroup: e.currentTarget.value })}
                />
              </div>
            </div>
            <button
              type="button"
              className="btn"
              onClick={() =>
                syncFromUi({
                  ...uiState,
                  rules: [...uiState.rules, { pattern: '', group: '', color: undefined, priority: undefined }]
                })
              }
            >
              ルール追加
            </button>
          </div>
          <div className="muted">Groupクリックで詳細編集。左端ハンドルで並び替えできます。</div>
          <div className="grid">
            <div className="table-wrap">
              <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
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
                        <tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                          ))}
                        </tr>
                      ))}
                    </SortableContext>
                  </tbody>
                </table>
              </DndContext>
            </div>
          </div>
        </div>
      )}

      <div className="panel stack">
        <div>
          <h3>プレビュー</h3>
          <div className="preview">{previewText || 'まだ実行していません。'}</div>
        </div>
        <div>
          <h3>履歴</h3>
          {historyEntries.length === 0 && <div className="muted">履歴はまだありません。</div>}
          {historyEntries.map((entry) => (
            <div className="history-item" key={entry.timestamp}>
              {entry.timestamp}
            </div>
          ))}
        </div>
      </div>

      <div
        className={`drawer-backdrop ${isDrawerOpen ? 'open' : ''}`}
        onClick={() => setSelectedRuleIndex(null)}
        aria-hidden={!isDrawerOpen}
      />
      <aside className={`drawer ${isDrawerOpen ? 'open' : ''}`} aria-hidden={!isDrawerOpen}>
        <div className="drawer-head">
          <h3 className="side-title">詳細編集</h3>
          <button type="button" className="btn btn-ghost" onClick={() => setSelectedRuleIndex(null)}>
            閉じる
          </button>
        </div>
        <div className="drawer-body">
          {!selectedRule && <div className="muted">Groupをクリックして選択してください。</div>}
          {selectedRule && (
            <div className="stack">
              <div>
                <label className="label">Group Name</label>
                <input
                  className="input"
                  value={selectedRule.group}
                  onChange={(e) => updateRule(selectedRuleIndex!, { group: e.currentTarget.value })}
                />
              </div>
              <div>
                <label className="label">Pattern</label>
                <input
                  className="input"
                  value={selectedRule.pattern}
                  onChange={(e) => updateRule(selectedRuleIndex!, { pattern: e.currentTarget.value })}
                />
              </div>
              <div>
                <label className="label">Status (color)</label>
                <ColorSelect
                  value={selectedRule.color}
                  onChange={(next) => updateRule(selectedRuleIndex!, { color: next })}
                />
              </div>
              <div>
                <label className="label">Target (priority)</label>
                <input
                  className="input"
                  type="number"
                  value={selectedRule.priority ?? ''}
                  onChange={(e) => {
                    const value = e.currentTarget.value;
                    updateRule(selectedRuleIndex!, { priority: value ? Number(value) : undefined });
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </aside>
    </div>
  );
}

const root = document.getElementById('root');
if (!root) throw new Error('root element not found');
createRoot(root).render(<App />);
