import assert from 'node:assert/strict';
import { mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { mkdtemp } from 'node:fs/promises';

import { assertReleaseTag, findSingleArtifact, publishRelease } from './release-guard.mjs';

test('accepts a tag matching the package version', () => {
  assert.doesNotThrow(() => assertReleaseTag('v1.2.3', '1.2.3'));
});

test('rejects malformed and mismatched release tags', () => {
  for (const tag of ['1.2.3', 'v1.2', 'v01.2.3', 'v1.2.3!']) {
    assert.throws(() => assertReleaseTag(tag, '1.2.3'), /release tag/);
  }
  assert.throws(() => assertReleaseTag('v1.2.4', '1.2.3'), /does not match/);
});

test('requires exactly one tarball in the artifact directory', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'patchscope-release-'));
  assert.throws(() => findSingleArtifact(directory), /found 0/);
  writeFileSync(join(directory, 'one.tgz'), 'one');
  assert.equal(findSingleArtifact(directory), join(directory, 'one.tgz'));
  writeFileSync(join(directory, 'two.tgz'), 'two');
  assert.throws(() => findSingleArtifact(directory), /found 2/);
});

function mockRunner(responses, calls) {
  return (_command, args) => {
    calls.push(args);
    return responses.shift() ?? { status: 0, stdout: '', stderr: '' };
  };
}

test('creates a missing release with notes and the explicit artifact', () => {
  const calls = [];
  const result = publishRelease({
    tag: 'v1.2.3', artifact: '/artifacts/pkg.tgz', notesFile: 'notes.md',
    run: mockRunner([{ status: 1, stdout: '', stderr: 'release not found' }, { status: 0 }], calls),
  });
  assert.equal(result, 'created');
  assert.deepEqual(calls, [
    ['release', 'view', 'v1.2.3', '--json', 'tagName'],
    ['release', 'create', 'v1.2.3', '--notes-file', 'notes.md', '/artifacts/pkg.tgz'],
  ]);
});

test('rerun updates notes and replaces the artifact without moving the tag', () => {
  const calls = [];
  const result = publishRelease({
    tag: 'v1.2.3', artifact: '/artifacts/pkg.tgz', notesFile: 'notes.md',
    run: mockRunner([{ status: 0 }, { status: 0 }, { status: 0 }], calls),
  });
  assert.equal(result, 'updated');
  assert.deepEqual(calls, [
    ['release', 'view', 'v1.2.3', '--json', 'tagName'],
    ['release', 'edit', 'v1.2.3', '--notes-file', 'notes.md'],
    ['release', 'upload', 'v1.2.3', '/artifacts/pkg.tgz', '--clobber'],
  ]);
  assert.equal(calls.flat().includes('--target'), false);
});

test('does not interpret an unrelated GitHub CLI failure as a missing release', () => {
  const calls = [];
  assert.throws(() => publishRelease({
    tag: 'v1.2.3', artifact: '/artifacts/pkg.tgz', notesFile: 'notes.md',
    run: mockRunner([{ status: 1, stdout: '', stderr: 'authentication failed' }], calls),
  }), /failed to inspect/);
  assert.equal(calls.length, 1);
});
