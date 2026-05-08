import path from 'node:path';

const GENERATED_NAMES = new Set(['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb', 'Cargo.lock', 'go.sum']);
const GENERATED_EXTENSIONS = new Set(['.min.js', '.min.css', '.map', '.lock']);

export function normalizeDirectory(filePath: string): string {
  const dir = path.posix.dirname(filePath.replaceAll('\\\\', '/'));
  return dir === '.' ? '.' : dir;
}

export function extensionOf(filePath: string): string {
  const base = path.posix.basename(filePath);
  if (base.endsWith('.min.js')) return '.min.js';
  if (base.endsWith('.min.css')) return '.min.css';
  const ext = path.posix.extname(base);
  return ext || '[none]';
}

export function isLockfile(filePath: string): boolean {
  return GENERATED_NAMES.has(path.posix.basename(filePath));
}

export function isGeneratedLike(filePath: string): boolean {
  const base = path.posix.basename(filePath);
  return isLockfile(filePath) || GENERATED_EXTENSIONS.has(extensionOf(filePath)) || base.includes('.generated.') || filePath.includes('/generated/');
}

export function subsystemFor(filePath: string): string {
  const clean = filePath.replaceAll('\\\\', '/');
  if (/^(test|tests|__tests__|spec)\//.test(clean) || /\.(test|spec)\.[cm]?[jt]sx?$/.test(clean)) return 'tests';
  if (/^(doc|docs)\//.test(clean) || /README|CHANGELOG|SECURITY|CONTRIBUTING/.test(clean)) return 'docs';
  if (/^(src|lib)\//.test(clean)) return 'source';
  if (/^(bin|cli|scripts)\//.test(clean)) return 'tooling';
  if (/^(\.github|github)\//.test(clean)) return 'ci';
  if (/package\.json$|tsconfig|eslint|prettier|vitest|jest|webpack|vite/.test(clean)) return 'config';
  if (isLockfile(clean)) return 'dependencies';
  return 'other';
}

export function stableRecord<T>(entries: Iterable<[string, T]>): Record<string, T> {
  return Object.fromEntries([...entries].sort(([a], [b]) => a.localeCompare(b)));
}
