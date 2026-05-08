import fs from 'node:fs';
import path from 'node:path';

export function readPackageScripts(cwd = process.cwd()): Record<string, string> {
  const packagePath = path.join(cwd, 'package.json');
  if (!fs.existsSync(packagePath)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(packagePath, 'utf8')) as { scripts?: Record<string, unknown> };
    return Object.fromEntries(Object.entries(parsed.scripts ?? {}).filter((entry): entry is [string, string] => typeof entry[1] === 'string'));
  } catch {
    return {};
  }
}

export function packageManagerCommand(script: string, cwd = process.cwd()): string {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return `pnpm run ${script}`;
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return `yarn ${script}`;
  if (fs.existsSync(path.join(cwd, 'bun.lockb'))) return `bun run ${script}`;
  return `npm run ${script}`;
}
