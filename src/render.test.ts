import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { renderJson } from './render-json.js';
import { renderMarkdown } from './render-markdown.js';
import { scanPatch } from './scan.js';

test('renders deterministic markdown and json reports', () => {
  const result = scanPatch({ diffText: readFileSync('examples/feature.patch', 'utf8'), cwd: process.cwd() });
  const markdown = renderMarkdown(result);
  const json = renderJson(result);
  assert.match(markdown, /# PatchScope Report/);
  assert.match(markdown, /src\/service\.ts/);
  const parsed = JSON.parse(json);
  assert.equal(parsed.generatedAt, 'deterministic-local');
  const markdownCommands = [...markdown.matchAll(/^- `([^`]+)` — .* \((high|medium|low)\)$/gm)].map((match) => match[1]);
  assert.deepEqual(markdownCommands, parsed.tests.map((suggestion: { command: string }) => suggestion.command));
  assert.deepEqual(parsed.tests.slice(0, 2).map((suggestion: { confidence: string }) => suggestion.confidence), ['high', 'high']);
});
