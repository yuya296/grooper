import { describe, expect, it } from 'vitest';
import { buildArtifactBaseName, sanitizeForArtifactName } from '../e2e/utils/artifacts.js';

describe('e2e artifact utils', () => {
  it('sanitizes test titles for artifact file names', () => {
    expect(sanitizeForArtifactName('Pattern match / fallback')).toBe('pattern-match-fallback');
    expect(sanitizeForArtifactName('  ')).toBe('e2e');
  });

  it('builds deterministic artifact base name with retry', () => {
    expect(buildArtifactBaseName('Apply modes', 2)).toBe('apply-modes-retry-2');
  });
});
