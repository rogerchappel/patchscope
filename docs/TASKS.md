# PatchScope Task Plan

## Wave 1 — Scaffold and project shape
- [x] Scaffold TypeScript OSS CLI with StackForge.
- [x] Copy the source PRD into `docs/PRD.md`.
- [x] Configure package metadata, TypeScript, build, test, check, and smoke scripts.

## Wave 2 — Patch analysis core
- [x] Parse unified git diffs from patch text.
- [x] Track changed files, hunks, additions, deletions, binary markers, and new/deleted files.
- [x] Classify directories, extensions, and likely subsystems.

## Wave 3 — Review signals
- [x] Detect secret-like additions with redacted output.
- [x] Flag generated, lockfile, binary, large, delete-heavy, missing-test, and missing-doc risk classes.
- [x] Suggest likely verification commands from changed paths and package scripts.

## Wave 4 — CLI and output
- [x] Implement `patchscope scan` for files, stdin, staged diffs, and worktree diffs.
- [x] Implement `patchscope suggest-tests`.
- [x] Render deterministic Markdown and JSON reports.
- [x] Support `--fail-on` local gate behavior.

## Wave 5 — Evidence and release readiness
- [x] Add checked-in patch fixtures.
- [x] Add parser, secret, risk, and renderer tests.
- [x] Add real fixture-backed CLI smoke script.
- [x] Document safety model, examples, contributing, and limitations.
- [ ] Publish GitHub repository and apply best-effort branch protection.
