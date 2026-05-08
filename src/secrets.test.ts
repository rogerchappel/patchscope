import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import { parseUnifiedDiff } from './parser.js';
import { detectSecrets, redactSecret } from './secrets.js';

test('detects and redacts secret-like additions', () => {
  const files = parseUnifiedDiff(readFileSync('examples/secret.patch', 'utf8'));
  const findings = detectSecrets(files);
  assert.equal(findings.length, 2);
  assert.ok(findings.every((finding) => !finding.redacted.includes('abcdefghijklmnopqrstuvwxyz123456')));
});

test('redacts long values with stable shape', () => {
  assert.equal(redactSecret('abcdefghijklmnopqrstuvwxyz'), 'abcd…wxyz (26 chars)');
});
