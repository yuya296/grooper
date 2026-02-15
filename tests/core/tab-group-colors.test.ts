import { describe, expect, it } from 'vitest';
import { TAB_GROUP_COLORS, isTabGroupColor } from '../../src/core/tab-group-colors.js';

describe('tab group colors', () => {
  it('contains chrome-compatible color values', () => {
    expect(TAB_GROUP_COLORS.map((entry) => entry.value)).toEqual([
      'grey',
      'blue',
      'red',
      'yellow',
      'green',
      'pink',
      'purple',
      'cyan',
      'orange'
    ]);
  });

  it('validates color values safely', () => {
    expect(isTabGroupColor('blue')).toBe(true);
    expect(isTabGroupColor('magenta')).toBe(false);
    expect(isTabGroupColor(undefined)).toBe(false);
  });
});
