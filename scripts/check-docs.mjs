import { readFileSync, readdirSync } from 'node:fs';
import { parseArgs } from '../dist/args.js';

function markdownFilesIn(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const path = `${directory}/${entry.name}`;
    if (entry.isDirectory()) return markdownFilesIn(path);
    return entry.isFile() && entry.name.endsWith('.md') ? [path] : [];
  });
}

const markdownFiles = ['README.md', ...markdownFilesIn('docs')];
let checked = 0;

for (const file of markdownFiles) {
  const lines = readFileSync(file, 'utf8').split('\n');
  for (const [index, line] of lines.entries()) {
    const match = line.match(/^\s*(?:patchscope|node dist\/cli\.js)\s+(.+?)\s*$/);
    if (!match) continue;

    const argv = match[1]
      .replace(/\s+(?:<|>|>>).*$/, '')
      .split(/\s+/);

    try {
      parseArgs(argv);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`${file}:${index + 1}: invalid documented CLI example: ${message}`);
    }
    checked += 1;
  }
}

if (checked === 0) throw new Error('No documented PatchScope CLI examples found.');
console.log(`Validated ${checked} documented PatchScope CLI examples.`);
