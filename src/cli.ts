#!/usr/bin/env node
import { readFileSync } from 'node:fs';
import { parseArgs } from './args.js';
import { readGitDiff } from './git.js';
import { helpText } from './help.js';
import { readPatchFile, readStdin, writeOutput } from './io.js';
import { renderJson } from './render-json.js';
import { renderMarkdown } from './render-markdown.js';
import { hasFailingRisk, scanPatch } from './scan.js';

async function diffFromArgs(args: ReturnType<typeof parseArgs>): Promise<string> {
  if (args.staged) return readGitDiff('staged');
  if (args.worktree) return readGitDiff('worktree');
  if (args.stdin) return readStdin();
  if (args.file) return readPatchFile(args.file);
  return '';
}

function version(): string {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')) as { version: string };
  return `${pkg.version}\n`;
}

async function main(): Promise<number> {
  const args = parseArgs(process.argv.slice(2));
  if (args.command === 'help') {
    process.stdout.write(helpText());
    return 0;
  }
  if (args.command === 'version') {
    process.stdout.write(version());
    return 0;
  }

  const result = scanPatch({ diffText: await diffFromArgs(args), cwd: process.cwd() });
  if (args.command === 'suggest-tests') {
    writeOutput(args.out, `${result.tests.map((test) => `${test.command} # ${test.reason} (${test.confidence})`).join('\n')}\n`);
    return hasFailingRisk(result, args.failOn) ? 1 : 0;
  }

  const content = args.json ? renderJson(result) : renderMarkdown(result);
  writeOutput(args.out, content);
  return hasFailingRisk(result, args.failOn) ? 1 : 0;
}

main().then((code) => {
  process.exitCode = code;
}).catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 2;
});
