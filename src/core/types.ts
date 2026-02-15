export type ApplyMode = 'manual' | 'newTabs' | 'always';
export type MatchMode = 'regex' | 'glob';
export type GroupingStrategy = 'inheritFirst' | 'ruleFirst' | 'ruleOnly';

export interface Rule {
  pattern: string;
  matchMode?: MatchMode;
}

export interface GroupCleanup {
  ttlMinutes?: number;
  maxTabs?: number;
  lru?: boolean;
}

export interface Group {
  name: string;
  color?: string;
  cleanup?: GroupCleanup;
  rules: Rule[];
}

export interface ShortcutsConfig {
  slots?: string[];
}

export interface Config {
  version: 2;
  applyMode?: ApplyMode;
  vars?: Record<string, string>;
  groupingStrategy?: GroupingStrategy;
  shortcuts?: ShortcutsConfig;
  groups: Group[];
}

export interface CompiledRule {
  pattern: string;
  matchMode: MatchMode;
  regex: RegExp;
  index: number;
  groupName: string;
  groupColor?: string;
}

export interface CompiledGroup {
  name: string;
  color?: string;
  cleanup: GroupCleanup;
  rules: CompiledRule[];
}

export interface CompiledConfig {
  version: 2;
  applyMode: ApplyMode;
  vars: Record<string, string>;
  groupingStrategy: GroupingStrategy;
  groups: CompiledGroup[];
  groupsByName: Record<string, CompiledGroup>;
  shortcuts?: ShortcutsConfig;
  rules: CompiledRule[];
}

export interface TabState {
  id: number;
  url?: string;
  groupId?: number;
  windowId: number;
  openerTabId?: number;
  active?: boolean;
  pinned?: boolean;
  index?: number;
  lastAccessed?: number;
  lastActiveAt?: number;
}

export interface GroupState {
  id: number;
  title: string;
  color?: string;
  windowId: number;
}

export interface StateSnapshot {
  tabs: TabState[];
  groups: GroupState[];
}

export type PlanAction =
  | { type: 'ensureGroup'; group: string; color?: string; windowId: number }
  | { type: 'moveTab'; tabId: number; group: string; windowId: number }
  | { type: 'closeTab'; tabId: number; reason: string }
  | { type: 'log'; level: 'info' | 'warn' | 'error'; message: string };

export interface Plan {
  actions: PlanAction[];
}
