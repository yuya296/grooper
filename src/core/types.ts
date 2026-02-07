export type ApplyMode = 'manual' | 'newTabs' | 'always';
export type MatchMode = 'regex' | 'glob';

export interface Rule {
  pattern: string;
  group: string;
  matchMode?: MatchMode;
  color?: string;
  priority?: number;
}

export interface GroupPolicy {
  color?: string;
  ttlMinutes?: number;
  maxTabs?: number;
  lru?: boolean;
}

export interface ShortcutsConfig {
  slots?: string[];
}

export interface Config {
  version: 1;
  applyMode?: ApplyMode;
  vars?: Record<string, string>;
  fallbackGroup?: string;
  parentFollow?: boolean;
  groups?: Record<string, GroupPolicy>;
  shortcuts?: ShortcutsConfig;
  rules: Rule[];
}

export interface CompiledRule extends Rule {
  matchMode: MatchMode;
  regex: RegExp;
  index: number;
  priority: number;
}

export interface CompiledConfig {
  version: 1;
  applyMode: ApplyMode;
  vars: Record<string, string>;
  fallbackGroup?: string;
  parentFollow: boolean;
  groups: Record<string, GroupPolicy>;
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
