#!/usr/bin/env node

import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readFileSync, readdirSync } from 'node:fs';
import { basename, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
export const artifactDirectory = join(root, 'release-artifacts');
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$/;

export function assertReleaseTag(tag, version) {
  if (typeof tag !== 'string' || !tag.startsWith('v') || !semver.test(tag.slice(1))) {
    throw new Error(`release tag must be a well-formed v-prefixed semantic version; received ${JSON.stringify(tag)}`);
  }
  if (!semver.test(version)) {
    throw new Error(`package.json version is not valid semantic version: ${JSON.stringify(version)}`);
  }
  if (tag !== `v${version}`) {
    throw new Error(`release tag ${tag} does not match package.json version ${version}`);
  }
}

export function findSingleArtifact(directory = artifactDirectory) {
  const archives = readdirSync(directory, { withFileTypes: true })
    .filter((entry) => entry.isFile() && entry.name.endsWith('.tgz'))
    .map((entry) => join(directory, entry.name));
  if (archives.length !== 1) {
    throw new Error(`expected exactly one package tarball in ${directory}; found ${archives.length}`);
  }
  return archives[0];
}

export function stageArtifact(directory = artifactDirectory, run = execFileSync) {
  mkdirSync(directory, { recursive: true });
  if (readdirSync(directory).length !== 0) {
    throw new Error(`artifact directory must be empty before staging: ${directory}`);
  }
  run('npm', ['pack', '--pack-destination', directory], { cwd: root, stdio: 'inherit' });
  return findSingleArtifact(directory);
}

export function publishRelease({ tag, artifact, notesFile, run = spawnSync }) {
  const view = run('gh', ['release', 'view', tag, '--json', 'tagName'], { encoding: 'utf8' });
  if (view.status === 0) {
    const edit = run('gh', ['release', 'edit', tag, '--notes-file', notesFile], { encoding: 'utf8' });
    if (edit.status !== 0) throw new Error(`failed to update release notes: ${edit.stderr || edit.stdout}`);
    const upload = run('gh', ['release', 'upload', tag, artifact, '--clobber'], { encoding: 'utf8' });
    if (upload.status !== 0) throw new Error(`failed to replace release artifact: ${upload.stderr || upload.stdout}`);
    return 'updated';
  }
  const missing = `${view.stderr || ''}${view.stdout || ''}`.toLowerCase().includes('release not found');
  if (!missing) throw new Error(`failed to inspect GitHub release: ${view.stderr || view.stdout}`);
  const create = run('gh', ['release', 'create', tag, '--notes-file', notesFile, artifact], { encoding: 'utf8' });
  if (create.status !== 0) throw new Error(`failed to create GitHub release: ${create.stderr || create.stdout}`);
  return 'created';
}

function packageVersion() {
  return JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')).version;
}

function usage() {
  return 'usage: node scripts/release-guard.mjs <check-tag|stage-artifact|check-artifact|publish> [arguments]';
}

export function main(argv = process.argv.slice(2)) {
  const [command, ...args] = argv;
  if (command === 'check-tag') {
    assertReleaseTag(args[0] ?? process.env.GITHUB_REF_NAME, packageVersion());
    return;
  }
  if (command === 'stage-artifact') {
    process.stdout.write(`${stageArtifact()}\n`);
    return;
  }
  if (command === 'check-artifact') {
    process.stdout.write(`${findSingleArtifact()}\n`);
    return;
  }
  if (command === 'publish') {
    const [tag = process.env.GITHUB_REF_NAME, notesFile = 'RELEASE_NOTES.md'] = args;
    assertReleaseTag(tag, packageVersion());
    const artifact = findSingleArtifact();
    process.stdout.write(`${publishRelease({ tag, artifact, notesFile })}\n`);
    return;
  }
  throw new Error(usage());
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    main();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
