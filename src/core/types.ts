export type ApplyMode = 'manual' | 'newTabs' | 'always';

export interface Rule {
  pattern: string;
  group: string;
  color?: string;
}

export interface Config {
  version: 1;
  applyMode?: ApplyMode;
  rules: Rule[];
}

export interface CompiledRule extends Rule {
  regex: RegExp;
  index: number;
}

export interface CompiledConfig {
  version: 1;
  applyMode: ApplyMode;
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
  | { type: 'log'; level: 'info' | 'warn' | 'error'; message: string };

export interface Plan {
  actions: PlanAction[];
}
