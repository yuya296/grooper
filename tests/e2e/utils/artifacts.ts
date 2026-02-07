export function sanitizeForArtifactName(value: string): string {
  const sanitized = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return sanitized || 'e2e';
}

export function buildArtifactBaseName(testTitle: string, retry: number): string {
  return `${sanitizeForArtifactName(testTitle)}-retry-${retry}`;
}
