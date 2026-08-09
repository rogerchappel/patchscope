import assert from 'node:assert/strict';
import test from 'node:test';
import { parseArgs } from './args.js';

const oneSourceError = 'Choose only one input source: file, --staged, --worktree, or --stdin.';

test('rejects a second positional patch source', () => {
  assert.throws(
    () => parseArgs(['scan', 'first.patch', 'second.patch']),
    { message: oneSourceError }
  );
});

test('rejects every empty --out value form', () => {
  for (const argv of [
    ['scan', 'input.patch', '--out'],
    ['scan', 'input.patch', '--out', ''],
    ['scan', 'input.patch', '--out='],
    ['scan', 'input.patch', '--out', '--json']
  ]) {
    assert.throws(() => parseArgs(argv), { message: '--out requires a file path' });
  }
});

test('rejects every missing or empty --fail-on value form', () => {
  for (const argv of [
    ['scan', 'input.patch', '--fail-on'],
    ['scan', 'input.patch', '--fail-on', ''],
    ['scan', 'input.patch', '--fail-on='],
    ['scan', 'input.patch', '--fail-on', '--json']
  ]) {
    assert.throws(() => parseArgs(argv), { message: '--fail-on requires a non-empty class list' });
  }
});

test('rejects operands and options for help and version', () => {
  for (const command of ['help', 'version']) {
    assert.throws(() => parseArgs([command, 'extra']), { message: `${command} does not accept operands or options` });
    assert.throws(() => parseArgs([command, '--json']), { message: `${command} does not accept operands or options` });
  }
});

test('keeps valid scan, suggest-tests, help, and version invocations working', () => {
  assert.deepEqual(parseArgs(['scan', 'input.patch', '--fail-on', 'secret,generated']).failOn, ['secret', 'generated']);
  assert.equal(parseArgs(['suggest-tests', '--staged']).staged, true);
  assert.equal(parseArgs(['help']).command, 'help');
  assert.equal(parseArgs(['version']).command, 'version');
});
