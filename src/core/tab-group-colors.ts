export const TAB_GROUP_COLORS = [
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

export type TabGroupColor = (typeof TAB_GROUP_COLORS)[number]['value'];

export const TAB_GROUP_COLOR_SET = new Set<string>(TAB_GROUP_COLORS.map((entry) => entry.value));

export function isTabGroupColor(value: unknown): value is TabGroupColor {
  return typeof value === 'string' && TAB_GROUP_COLOR_SET.has(value);
}
