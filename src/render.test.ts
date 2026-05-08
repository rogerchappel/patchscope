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
  assert.equal(JSON.parse(json).generatedAt, 'deterministic-local');
});
