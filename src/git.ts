import { spawnSync } from 'node:child_process';

export function readGitDiff(mode: 'staged' | 'worktree', cwd = process.cwd()): string {
  const args = mode === 'staged' ? ['diff', '--staged', '--binary'] : ['diff', '--binary'];
  const result = spawnSync('git', args, { cwd, encoding: 'utf8' });
  if (result.status !== 0) {
    throw new Error((result.stderr || `git ${args.join(' ')} failed`).trim());
  }
  return result.stdout;
}
