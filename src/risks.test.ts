import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { scanPatch } from './scan.js';

test('flags secrets as critical risk', () => {
  const result = scanPatch({ diffText: readFileSync('examples/secret.patch', 'utf8'), cwd: process.cwd() });
  assert.ok(result.risks.some((risk) => risk.class === 'secret' && risk.level === 'critical'));
});

test('flags lockfile generated patches', () => {
  const result = scanPatch({ diffText: readFileSync('examples/generated.patch', 'utf8'), cwd: process.cwd() });
  assert.ok(result.risks.some((risk) => risk.class === 'lockfile'));
  assert.ok(result.risks.some((risk) => risk.class === 'generated'));
});
