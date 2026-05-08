# PatchScope PRD

Status: in-progress

## Summary

PatchScope is a local-first TypeScript CLI that inspects git patches and working-tree diffs for review risk: touched subsystems, likely tests, secret-looking additions, large generated-file changes, and missing documentation updates. It is built for developers and agentic coding loops that need deterministic pre-review evidence without uploading code. Think of it as a tiny review radar for patches before they hit GitHub.

## Source attribution

Created during the twice-daily OSS factory run on 2026-05-08. Web search was attempted for current developer-tool pain points, but the configured search provider returned an authentication/plan error, so this PRD is based on local OSS factory context, recurring agent workflow needs, and general public patterns around reproducible CLI tooling.

## Target users

- Agent teams preparing patches for human review.
- OSS maintainers who want small, scriptable quality gates.
- Developers who need a quick local risk summary before committing or pushing.

## Problem

Patch review often starts with a noisy raw diff. Agents can change many files quickly, and humans need a compact, deterministic map of what changed, what looks risky, and what tests probably matter. Existing hosted review tools are useful, but a local preflight should catch obvious issues before source leaves the machine.

## Goals

- Analyze `git diff`, patch files, or stdin entirely offline.
- Produce stable Markdown and JSON review summaries.
- Redact obvious secrets and flag suspicious additions.
- Suggest likely test/smoke commands from changed paths and package scripts.
- Exit non-zero for configurable risk thresholds.
- Include fixture-backed tests and copy-paste CLI examples.

## Non-goals

- LLM code review.
- Hosted dashboards or accounts.
- Replacing full static analysis, SAST, or CI.
- Automatically modifying source files.

## V1 CLI

```bash
patchscope scan --staged --out patchscope.md
patchscope scan examples/feature.patch --json --fail-on secret,huge-generated
patchscope suggest-tests --diff examples/feature.patch
```

## Functional requirements

1. Parse unified diff input from files, stdin, `--staged`, or current working tree.
2. Group touched files by extension, directory, and likely subsystem.
3. Detect added secret-like values with safe redacted output.
4. Detect generated/minified/lockfile-heavy patches and large binary markers.
5. Suggest tests based on package scripts, changed paths, and common conventions.
6. Render deterministic Markdown and JSON.
7. Support `--fail-on` risk classes for local CI gates.
8. Avoid telemetry, external network calls, and hidden writes.

## Acceptance criteria

- `npm test`, `npm run check`, `npm run build`, and `npm run smoke` pass.
- `bash scripts/validate.sh` passes when present.
- At least one real CLI smoke uses a checked-in patch fixture.
- README explains why the tool exists, quick start, examples, safety model, and limitations.
- GitHub repository is public under `rogerchappel/patchscope` with useful description and topics.

## Suggested implementation waves

1. Scaffold TypeScript CLI with StackForge and planning docs.
2. Add unified diff parser and risk model.
3. Add renderers for Markdown and JSON.
4. Add CLI commands, fixtures, tests, and smoke script.
5. Polish README, metadata, topics, branch protection, and release-readiness notes.
